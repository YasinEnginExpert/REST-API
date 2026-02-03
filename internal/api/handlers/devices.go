package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
	"strings"

	"github.com/gorilla/mux"
)

// GetDevices handles GET requests for listing devices with optional filtering
func GetDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	filters := make(map[string]string)
	queryParams := r.URL.Query()

	for k, v := range queryParams {
		if k == "sortby" {
			continue
		}
		if len(v) > 0 && v[0] != "" {
			filters[k] = v[0]
		}
	}

	sorts := r.URL.Query()["sortby"]

	repo := sqlconnect.NewDeviceRepository(db)
	devices, err := repo.GetAll(filters, sorts)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch devices").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string          `json:"status"`
		Count  int             `json:"count"`
		Data   []models.Device `json:"data"`
	}{
		Status: "success",
		Count:  len(devices),
		Data:   devices,
	}

	json.NewEncoder(w).Encode(response)
}

// GetDevice handles GET requests for a single device by ID
func GetDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewDeviceRepository(db)
	d, err := repo.GetByID(id)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "Device not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch device").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(d)
}

// CreateDevice handles POST requests to add a new device
func CreateDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var d models.Device
	// Strict JSON decoding to disallow unknown fields
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&d); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate device data
	if err := d.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	repo := sqlconnect.NewDeviceRepository(db)
	createdDevice, err := repo.Create(d)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create device").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string        `json:"status"`
		Data   models.Device `json:"data"`
	}{
		Status: "success",
		Data:   *createdDevice,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateDevice handles PUT requests (Full Update)
func UpdateDevice(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var d models.Device
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&d); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate device data
	if err := d.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	d.ID = id
	repo := sqlconnect.NewDeviceRepository(db)
	rowsAffected, err := repo.Update(d)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update device").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Device not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(d)
}

// DeleteDevice handles DELETE requests
func DeleteDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewDeviceRepository(db)
	rowsAffected, err := repo.Delete(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete device").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Device not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// PatchDevice handles PATCH requests (Partial Update)
func PatchDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(updates) == 0 {
		pkgutils.JSONError(w, "No fields to update", http.StatusBadRequest)
		return
	}

	allowedFields := map[string]bool{
		"hostname":      true,
		"ip":            true,
		"model":         true,
		"vendor":        true,
		"os":            true,
		"serial_number": true,
		"status":        true,
		"rack_position": true,
		"location_id":   true,
	}

	// VALIDATION LOGIC start
	// 1. Check for empty strings on required fields if they are present
	if val, ok := updates["hostname"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		pkgutils.JSONError(w, "hostname cannot be empty", http.StatusBadRequest)
		return
	}
	if val, ok := updates["ip"]; ok {
		ipStr := fmt.Sprintf("%v", val)
		if strings.TrimSpace(ipStr) == "" {
			pkgutils.JSONError(w, "ip cannot be empty", http.StatusBadRequest)
			return
		}
		if net.ParseIP(ipStr) == nil {
			pkgutils.JSONError(w, "invalid ip address format", http.StatusBadRequest)
			return
		}
	}
	if val, ok := updates["status"]; ok {
		status := strings.ToLower(fmt.Sprintf("%v", val))
		validStatuses := map[string]bool{"active": true, "offline": true, "maintenance": true, "provisioning": true}
		if !validStatuses[status] {
			pkgutils.JSONError(w, "invalid status", http.StatusBadRequest)
			return
		}
	}
	// VALIDATION LOGIC end

	repo := sqlconnect.NewDeviceRepository(db)
	rowsAffected, err := repo.Patch(id, updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to patch device").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Device not found", http.StatusNotFound)
		return
	}

	// Fetch updated device to return
	d, err := repo.GetByID(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch updated device").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(d)
}

// BulkPatchDevices handles updating multiple devices at once
func BulkPatchDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Parse Request Body
	var updates []map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(updates) == 0 {
		pkgutils.JSONError(w, "No updates provided", http.StatusBadRequest)
		return
	}

	allowedFields := map[string]bool{
		"hostname":      true,
		"ip":            true,
		"model":         true,
		"vendor":        true,
		"os":            true,
		"serial_number": true,
		"status":        true,
		"rack_position": true,
		"location_id":   true,
	}

	// Pre-validate
	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			pkgutils.JSONError(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		// VALIDATION
		if val, ok := item["hostname"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
			pkgutils.JSONError(w, fmt.Sprintf("hostname cannot be empty for device %v", id), http.StatusBadRequest)
			return
		}
		if val, ok := item["status"]; ok {
			status := strings.ToLower(fmt.Sprintf("%v", val))
			validStatuses := map[string]bool{"active": true, "offline": true, "maintenance": true, "provisioning": true}
			if !validStatuses[status] {
				pkgutils.JSONError(w, fmt.Sprintf("invalid status for device %v", id), http.StatusBadRequest)
				return
			}
		}
		if val, ok := item["ip"]; ok {
			ipStr := fmt.Sprintf("%v", val)
			if ipStr != "" && net.ParseIP(ipStr) == nil {
				pkgutils.JSONError(w, fmt.Sprintf("invalid ip address format for device %v", id), http.StatusBadRequest)
				return
			}
		}
	}

	repo := sqlconnect.NewDeviceRepository(db)
	err := repo.BulkPatch(updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk update devices").Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk update completed successfully"}`))
}

// BulkDeleteDevices handles deleting multiple devices at once
func BulkDeleteDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Parse Request Body (Expects a list of IDs)
	var ids []string
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(ids) == 0 {
		pkgutils.JSONError(w, "No IDs provided", http.StatusBadRequest)
		return
	}

	repo := sqlconnect.NewDeviceRepository(db)
	err := repo.BulkDelete(ids)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			pkgutils.JSONError(w, err.Error(), http.StatusNotFound)
		} else {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk delete devices").Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}

// GetDevicesByLocation handles GET requests for devices in a specific location
// Route: /locations/{id}/devices
func GetDevicesByLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	locationID := vars["id"]

	// Reuse existing filter logic
	filters := map[string]string{
		"location_id": locationID,
	}

	sorts := r.URL.Query()["sortby"]

	repo := sqlconnect.NewDeviceRepository(db)
	devices, err := repo.GetAll(filters, sorts)

	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch devices for location").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string          `json:"status"`
		Count  int             `json:"count"`
		Data   []models.Device `json:"data"`
	}{
		Status: "success",
		Count:  len(devices),
		Data:   devices,
	}

	json.NewEncoder(w).Encode(response)
}
