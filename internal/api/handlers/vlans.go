package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
	"strings"

	"github.com/gorilla/mux"
)

// GetVLANs handles GET requests for listing VLANs with optional filtering
func GetVLANs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	limit, offset, page := pkgutils.ParsePagination(r)
	filters := make(map[string]string)
	queryParams := r.URL.Query()

	for k, v := range queryParams {
		if k == "sortby" || k == "page" || k == "limit" {
			continue
		}
		if len(v) > 0 && v[0] != "" {
			filters[k] = v[0]
		}
	}

	sorts := r.URL.Query()["sortby"]

	repo := sqlconnect.NewVLANRepository(db)
	vlans, err := repo.GetAll(filters, sorts, limit, offset)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch VLANs").Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := repo.Count(filters)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count VLANs").Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalPages:  pkgutils.CalculateTotalPages(totalCount, limit),
			TotalCount:  totalCount,
		},
		Data: vlans,
	}

	json.NewEncoder(w).Encode(response)
}

// GetVLAN handles GET requests for a single VLAN
func GetVLAN(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewVLANRepository(db)
	v, err := repo.GetByID(id)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "VLAN not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch VLAN").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(v)
}

// CreateVLAN handles POST requests
func CreateVLAN(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var vlan models.VLAN
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&vlan); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate VLAN data
	if err := vlan.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	vlanRepo := sqlconnect.NewVLANRepository(db)
	createdVLAN, err := vlanRepo.Create(vlan)

	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create VLAN").Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] Created VLAN: %s (ID: %s)", createdVLAN.Name, createdVLAN.ID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdVLAN)
}

// UpdateVLAN handles PUT requests
func UpdateVLAN(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var vlan models.VLAN
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&vlan); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate VLAN data
	if err := vlan.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	vlan.ID = id
	vlanRepo := sqlconnect.NewVLANRepository(db)
	rowsAffected, err := vlanRepo.Update(vlan)

	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update VLAN").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "VLAN not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Updated VLAN ID: %s", id)
	json.NewEncoder(w).Encode(vlan)
}

// DeleteVLAN handles DELETE requests
func DeleteVLAN(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	vlanRepo := sqlconnect.NewVLANRepository(db)
	rowsAffected, err := vlanRepo.Delete(id)

	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete VLAN").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "VLAN not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Deleted VLAN ID: %s", id)
	w.WriteHeader(http.StatusNoContent)
}

// PatchVLAN handles PATCH requests (Partial Update)
func PatchVLAN(w http.ResponseWriter, r *http.Request) {
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
		"vlan_id":     true,
		"name":        true,
		"description": true,
	}

	// VALIDATION
	if err := validateVLANUpdate(id, updates); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	vlanRepo := sqlconnect.NewVLANRepository(db)
	rowsAffected, err := vlanRepo.Patch(id, updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to patch VLAN").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "VLAN not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Patched VLAN ID: %s", id)

	// Fetch updated vlan to return
	vlan, err := vlanRepo.GetByID(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch updated VLAN").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(vlan)
}

// BulkPatchVLANs handles updating multiple VLANs at once
func BulkPatchVLANs(w http.ResponseWriter, r *http.Request) {
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
		"vlan_id":     true,
		"name":        true,
		"description": true,
	}

	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			pkgutils.JSONError(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		// VALIDATION
		if err := validateVLANUpdate(id, item); err != nil {
			pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	repo := sqlconnect.NewVLANRepository(db)
	err := repo.BulkPatch(updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk update VLANs").Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk update completed successfully"}`))
}

// BulkDeleteVLANs handles deleting multiple VLANs at once
func BulkDeleteVLANs(w http.ResponseWriter, r *http.Request) {
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

	vlanRepo := sqlconnect.NewVLANRepository(db)
	err := vlanRepo.BulkDelete(ids)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			pkgutils.JSONError(w, err.Error(), http.StatusNotFound)
		} else {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk delete VLANs").Error(), http.StatusInternalServerError)
		}
		return
	}

	log.Printf("[INFO] Bulk Deleted VLANs: %v", ids)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}

// validateVLANUpdate checks if the updates map contains valid data
func validateVLANUpdate(id interface{}, updates map[string]interface{}) error {
	if val, ok := updates["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		return fmt.Errorf("name cannot be empty for vlan %v", id)
	}
	if val, ok := updates["vlan_id"]; ok {
		vlanIDStr := fmt.Sprintf("%v", val)
		var vlanID int
		if _, err := fmt.Sscanf(vlanIDStr, "%d", &vlanID); err != nil {
			return fmt.Errorf("invalid vlan_id format for vlan %v", id)
		}
		if vlanID < 1 || vlanID > 4094 {
			return fmt.Errorf("vlan_id must be between 1 and 4094 for vlan %v", id)
		}
	}
	return nil
}
