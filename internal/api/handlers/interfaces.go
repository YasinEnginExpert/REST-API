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

// GetInterfaces handles GET requests for listing interfaces with optional filtering
func GetInterfaces(w http.ResponseWriter, r *http.Request) {
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

	repo := sqlconnect.NewInterfaceRepository(db)
	interfaces, err := repo.GetAll(filters, sorts)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch interfaces").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string             `json:"status"`
		Count  int                `json:"count"`
		Data   []models.Interface `json:"data"`
	}{
		Status: "success",
		Count:  len(interfaces),
		Data:   interfaces,
	}

	json.NewEncoder(w).Encode(response)
}

// GetInterface handles GET requests for a single interface
func GetInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewInterfaceRepository(db)
	i, err := repo.GetByID(id)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch interface").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(i)

}

// CreateInterface handles POST requests
func CreateInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var i models.Interface

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&i); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := i.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	repo := sqlconnect.NewInterfaceRepository(db)
	createdInterface, err := repo.Create(i)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create interface").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string           `json:"status"`
		Data   models.Interface `json:"data"`
	}{
		Status: "success",
		Data:   *createdInterface,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateInterface handles PUT requests
func UpdateInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var i models.Interface
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&i); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := i.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	i.ID = id
	repo := sqlconnect.NewInterfaceRepository(db)
	rowsAffected, err := repo.Update(i)

	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update interface").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(i)
}

// DeleteInterface handles DELETE requests
func DeleteInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewInterfaceRepository(db)
	rowsAffected, err := repo.Delete(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete interface").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// PatchInterface handles PATCH requests
func PatchInterface(w http.ResponseWriter, r *http.Request) {
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
		"name":        true,
		"type":        true,
		"description": true,
		"mac_address": true,
		"speed":       true,
		"status":      true,
		"device_id":   true,
	}

	// VALIDATION
	if val, ok := updates["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		pkgutils.JSONError(w, "name cannot be empty", http.StatusBadRequest)
		return
	}
	if val, ok := updates["status"]; ok {
		status := strings.ToLower(fmt.Sprintf("%v", val))
		if status != "up" && status != "down" && status != "testing" {
			pkgutils.JSONError(w, "invalid status", http.StatusBadRequest)
			return
		}
	}
	if val, ok := updates["mac_address"]; ok {
		mac := fmt.Sprintf("%v", val)
		if mac != "" { // Allow empty to clear? Assuming Validation logic in model.
			// If not empty, check valid
			if _, err := net.ParseMAC(mac); err != nil {
				pkgutils.JSONError(w, "invalid mac address format", http.StatusBadRequest)
				return
			}
		}
	}

	repo := sqlconnect.NewInterfaceRepository(db)
	rowsAffected, err := repo.Patch(id, updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to patch interface").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}

	// Fetch updated
	i, err := repo.GetByID(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch updated interface").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(i)
}

// BulkPatchInterfaces handles updating multiple interfaces at once
func BulkPatchInterfaces(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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
		"name":        true,
		"type":        true,
		"description": true,
		"mac_address": true,
		"speed":       true,
		"status":      true,
		"device_id":   true,
	}

	// Pre-validate
	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			pkgutils.JSONError(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}
		// Basic validations
		if val, ok := item["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
			pkgutils.JSONError(w, fmt.Sprintf("name cannot be empty for interface %v", id), http.StatusBadRequest)
			return
		}
		if val, ok := item["status"]; ok {
			status := strings.ToLower(fmt.Sprintf("%v", val))
			if status != "up" && status != "down" && status != "testing" {
				pkgutils.JSONError(w, fmt.Sprintf("invalid status for interface %v", id), http.StatusBadRequest)
				return
			}
		}
	}

	repo := sqlconnect.NewInterfaceRepository(db)
	err := repo.BulkPatch(updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk update interfaces").Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk update completed successfully"}`))
}

// BulkDeleteInterfaces handles deleting multiple interfaces at once
func BulkDeleteInterfaces(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var ids []string
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(ids) == 0 {
		pkgutils.JSONError(w, "No IDs provided", http.StatusBadRequest)
		return
	}

	repo := sqlconnect.NewInterfaceRepository(db)
	err := repo.BulkDelete(ids)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			pkgutils.JSONError(w, err.Error(), http.StatusNotFound)
		} else {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk delete interfaces").Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}

// GetInterfacesByDevice handles GET requests for interfaces on a specific device
// Route: /devices/{id}/interfaces
func GetInterfacesByDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	deviceID := vars["id"]

	filters := map[string]string{
		"device_id": deviceID,
	}

	sorts := r.URL.Query()["sortby"]

	repo := sqlconnect.NewInterfaceRepository(db)
	interfaces, err := repo.GetAll(filters, sorts)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch interfaces for device").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string             `json:"status"`
		Count  int                `json:"count"`
		Data   []models.Interface `json:"data"`
	}{
		Status: "success",
		Count:  len(interfaces),
		Data:   interfaces,
	}

	json.NewEncoder(w).Encode(response)
}

// GetInterfaceCount handles GET requests for counting interfaces on a specific device
// Route: /devices/{id}/interfacecount
func GetInterfaceCount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	deviceID := vars["id"]

	repo := sqlconnect.NewInterfaceRepository(db)
	interfaceCount, err := repo.GetCountByDeviceID(deviceID)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count interfaces").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}{
		Status: "success",
		Count:  interfaceCount,
	}
	json.NewEncoder(w).Encode(response)
}
