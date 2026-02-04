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

// GetLocations handles GET requests for listing locations with optional filtering
func GetLocations(w http.ResponseWriter, r *http.Request) {
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

	repo := sqlconnect.NewLocationRepository(db)
	locations, err := repo.GetAll(filters, sorts, limit, offset)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch locations").Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := repo.Count(filters)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count locations").Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalPages:  pkgutils.CalculateTotalPages(totalCount, limit),
			TotalCount:  totalCount,
		},
		Data: locations,
	}

	json.NewEncoder(w).Encode(response)
}

// CreateLocation handles POST requests
func CreateLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var location models.Location
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&location); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate location data
	if err := location.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	locationRepo := sqlconnect.NewLocationRepository(db)
	createdLocation, err := locationRepo.Create(location)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create location").Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] Created Location: %s (ID: %v)", createdLocation.Name, createdLocation.ID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdLocation)
}

// GetLocation handles GET Single Location
func GetLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewLocationRepository(db)
	l, err := repo.GetByID(id)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "Location not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch location").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(l)
}

// UpdateLocation handles PUT requests
func UpdateLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var location models.Location
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&location); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate location data
	if err := location.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	location.ID = id
	locationRepo := sqlconnect.NewLocationRepository(db)
	rowsAffected, err := locationRepo.Update(location)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update location").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Location not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Updated Location ID: %s", id)

	json.NewEncoder(w).Encode(location)
}

// DeleteLocation handles DELETE requests
func DeleteLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	locationRepo := sqlconnect.NewLocationRepository(db)
	rowsAffected, err := locationRepo.Delete(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete location").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Location not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Deleted Location ID: %s", id)
	w.WriteHeader(http.StatusNoContent)
}

// PatchLocation handles PATCH requests (Partial Update)
func PatchLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	allowedFields := map[string]bool{
		"name":    true,
		"city":    true,
		"country": true,
		"address": true,
	}

	// VALIDATION
	if err := validateLocationUpdate(id, updates); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	locationRepo := sqlconnect.NewLocationRepository(db)
	rowsAffected, err := locationRepo.Patch(id, updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to patch location").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Location not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] Patched Location ID: %s", id)

	// Fetch updated location to return
	location, err := locationRepo.GetByID(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch updated location").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(location)
}

// BulkPatchLocations handles updating multiple locations at once
func BulkPatchLocations(w http.ResponseWriter, r *http.Request) {
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
		"name":    true,
		"city":    true,
		"country": true,
		"address": true,
	}

	// Pre-validate
	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			pkgutils.JSONError(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}
		if err := validateLocationUpdate(id, item); err != nil {
			pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	repo := sqlconnect.NewLocationRepository(db)
	err := repo.BulkPatch(updates, allowedFields)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk update locations").Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk update completed successfully"}`))
}

// BulkDeleteLocations handles deleting multiple locations at once
func BulkDeleteLocations(w http.ResponseWriter, r *http.Request) {
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

	locationRepo := sqlconnect.NewLocationRepository(db)
	err := locationRepo.BulkDelete(ids)
	if err != nil {
		// Differentiate not found vs other errors if possible, or just 500
		if strings.Contains(err.Error(), "not found") {
			pkgutils.JSONError(w, err.Error(), http.StatusNotFound)
		} else {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to bulk delete locations").Error(), http.StatusInternalServerError)
		}
		return
	}

	log.Printf("[INFO] Bulk Deleted Locations: %v", ids)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}

func GetDeviceCount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	locationID := vars["id"]

	repo := sqlconnect.NewLocationRepository(db)
	deviceCount, err := repo.GetDeviceCount(locationID)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count devices").Error(), http.StatusInternalServerError)
		return
	}
	response := struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}{
		Status: "success",
		Count:  deviceCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// validateLocationUpdate checks if the updates map contains valid data
func validateLocationUpdate(id interface{}, updates map[string]interface{}) error {
	if val, ok := updates["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		return fmt.Errorf("name cannot be empty for location %v", id)
	}
	if val, ok := updates["city"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		return fmt.Errorf("city cannot be empty for location %v", id)
	}
	if val, ok := updates["country"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		return fmt.Errorf("country cannot be empty for location %v", id)
	}
	if val, ok := updates["address"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		return fmt.Errorf("address cannot be empty for location %v", id)
	}
	return nil
}
