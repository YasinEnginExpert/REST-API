package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/utils"
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

	// 1. Build Query from Filters
	query, args := FilterDevices(filters)

	// 2. Add Sorting
	sorts := r.URL.Query()["sortby"]
	query = AddDeviceSorting(query, sorts)

	// 3. Execute Query
	devices, err := SelectDevices(query, args)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to fetch devices").Error(), http.StatusInternalServerError)
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

// FilterDevices builds the SQL query based on filters
func FilterDevices(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, hostname, ip, model, vendor, os, serial_number, status, rack_position, location_id, created_at, updated_at FROM devices WHERE 1=1"
	var args []interface{}
	argId := 1

	// Allowed filters mapping to DB columns
	allowedParams := map[string]string{
		"hostname":      "hostname",
		"ip":            "ip",
		"model":         "model",
		"vendor":        "vendor",
		"os":            "os",
		"serial_number": "serial_number",
		"status":        "status",
		"rack_position": "rack_position",
		"location_id":   "location_id",
		"created_at":    "created_at",
		"updated_at":    "updated_at",
	}

	for param, value := range filters {
		if dbField, ok := allowedParams[param]; ok {
			query += fmt.Sprintf(" AND %s = $%d", dbField, argId)
			args = append(args, value)
			argId++
		}
	}
	return query, args
}

// AddDeviceSorting appends ORDER BY clauses to the query
func AddDeviceSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"hostname":      true,
		"ip":            true,
		"model":         true,
		"vendor":        true,
		"os":            true,
		"serial_number": true,
		"status":        true,
		"rack_position": true,
		"location_id":   true,
		"created_at":    true,
		"updated_at":    true,
	}

	var orderClauses []string
	for _, sortParam := range sorts {
		parts := strings.Split(sortParam, ":")
		if len(parts) != 2 {
			continue
		}
		field, order := parts[0], parts[1]

		if allowedParams[field] && isValidSortOrder(order) {
			orderClauses = append(orderClauses, fmt.Sprintf("%s %s", field, order))
		}
	}

	if len(orderClauses) > 0 {
		query += " ORDER BY " + strings.Join(orderClauses, ", ")
	}
	return query
}

// SelectDevices executes the query and returns device list
func SelectDevices(query string, args []interface{}) ([]models.Device, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []models.Device
	for rows.Next() {
		var d models.Device
		var serialNumber, rackPosition, locationID, createdAt, updatedAt sql.NullString

		err := rows.Scan(&d.ID, &d.Hostname, &d.IP, &d.Model, &d.Vendor, &d.OS, &serialNumber, &d.Status, &rackPosition, &locationID, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}

		d.SerialNumber = serialNumber.String
		d.RackPosition = rackPosition.String
		d.LocationID = locationID.String
		d.CreatedAt = createdAt.String
		d.UpdatedAt = updatedAt.String

		devices = append(devices, d)
	}
	return devices, nil
}

func isValidSortOrder(order string) bool {
	return order == "asc" || order == "desc"
}

func isValidSortField(field string) bool {
	validFields := map[string]bool{
		"hostname":      true,
		"ip":            true,
		"model":         true,
		"vendor":        true,
		"os":            true,
		"serial_number": true,
		"status":        true,
		"rack_position": true,
		"location_id":   true,
		"created_at":    true,
		"updated_at":    true,
	}
	return validFields[field]
}

// GetDevice handles GET requests for a single device by ID
func GetDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	var d models.Device
	var serialNumber, rackPosition, locationID, createdAt, updatedAt sql.NullString

	query := "SELECT id, hostname, ip, model, vendor, os, serial_number, status, rack_position, location_id, created_at, updated_at FROM devices WHERE id = $1"
	err := db.QueryRow(query, id).Scan(&d.ID, &d.Hostname, &d.IP, &d.Model, &d.Vendor, &d.OS, &serialNumber, &d.Status, &rackPosition, &locationID, &createdAt, &updatedAt)

	sortParams := r.URL.Query()["sortby"]
	if len(sortParams) > 0 {
		query += "ORDERE BY"
		for i, param := range sortParams {
			parts := strings.Split(param, ":")
			if len(parts) != 2 {
				continue
			}
			field, order := parts[0], parts[1]
			if !isValidSortField(field) || !isValidSortOrder(order) {
				continue
			}
			if i > 0 {
				query += ","
			}
			query += " " + field + " " + order
		}
	}

	if err == sql.ErrNoRows {
		http.Error(w, "Device not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to fetch device").Error(), http.StatusInternalServerError)
		return
	}

	d.SerialNumber = serialNumber.String
	d.RackPosition = rackPosition.String
	d.LocationID = locationID.String
	d.CreatedAt = createdAt.String
	d.UpdatedAt = updatedAt.String

	json.NewEncoder(w).Encode(d)
}

// CreateDevice handles POST requests to add a new device
func CreateDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var d models.Device
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// Insert into DB
	// Insert into DB
	data, err := utils.GetStructValues(d)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to parse device data").Error(), http.StatusInternalServerError)
		return
	}

	query, args, err := utils.GenerateInsertQuery("devices", data)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to generate insert query").Error(), http.StatusInternalServerError)
		return
	}

	err = db.QueryRow(query, args...).Scan(&d.ID)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to create device").Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string        `json:"status"`
		Data   models.Device `json:"data"`
	}{
		Status: "success",
		Data:   d,
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
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	query := `UPDATE devices SET hostname=$1, ip=$2, model=$3, vendor=$4, os=$5, serial_number=$6, status=$7, rack_position=$8, location_id=$9, updated_at=CURRENT_TIMESTAMP 
			  WHERE id=$10`

	res, err := db.Exec(query, d.Hostname, d.IP, d.Model, d.Vendor, d.OS, d.SerialNumber, d.Status, d.RackPosition, d.LocationID, id)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to update device").Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Device not found", http.StatusNotFound)
		return
	}

	d.ID = id
	json.NewEncoder(w).Encode(d)
}

// DeleteDevice handles DELETE requests
func DeleteDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	query := "DELETE FROM devices WHERE id = $1"
	res, err := db.Exec(query, id)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to delete device").Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Device not found", http.StatusNotFound)
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
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
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

	// Use generic builder
	query, args, err := utils.BuildUpdateQuery("devices", updates, allowedFields, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Inject updated_at=CURRENT_TIMESTAMP
	// utils.BuildUpdateQuery returns "UPDATE table SET a=$1 WHERE id=$2"
	// We simply adding the updated_at clause before the WHERE clause.
	query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

	res, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to patch device").Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Device not found", http.StatusNotFound)
		return
	}

	// Fetch updated device to return
	var d models.Device
	var serialNumber, rackPosition, locationID, createdAt, updatedAt sql.NullString

	fetchQuery := "SELECT id, hostname, ip, model, vendor, os, serial_number, status, rack_position, location_id, created_at, updated_at FROM devices WHERE id = $1"
	err = db.QueryRow(fetchQuery, id).Scan(&d.ID, &d.Hostname, &d.IP, &d.Model, &d.Vendor, &d.OS, &serialNumber, &d.Status, &rackPosition, &locationID, &createdAt, &updatedAt)
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to fetch updated device").Error(), http.StatusInternalServerError)
		return
	}

	d.SerialNumber = serialNumber.String
	d.RackPosition = rackPosition.String
	d.LocationID = locationID.String
	d.CreatedAt = createdAt.String
	d.UpdatedAt = updatedAt.String

	json.NewEncoder(w).Encode(d)
}

// BulkPatchDevices handles updating multiple devices at once
func BulkPatchDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Parse Request Body
	var updates []map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(updates) == 0 {
		http.Error(w, "No updates provided", http.StatusBadRequest)
		return
	}

	// 2. Start Transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to start database transaction").Error(), http.StatusInternalServerError)
		return
	}

	// Defer Rollback in case of panic or error (if not committed)
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

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

	// 3. Loop through updates
	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			http.Error(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return // Triggers rollback via defer
		}

		// Use Builder
		query, args, err := utils.BuildUpdateQuery("devices", item, allowedFields, id)
		if err != nil {
			// Skip if no valid fields provided for this item
			continue
		}

		// Inject updated_at
		query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

		_, err = tx.Exec(query, args...)
		if err != nil {
			http.Error(w, pkgutils.ErrorHandler(err, fmt.Sprintf("Error updating device ID %v", id)).Error(), http.StatusInternalServerError)
			return // Triggers rollback
		}
	}

	// 4. Commit Transaction
	err = tx.Commit()
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to commit transaction").Error(), http.StatusInternalServerError)
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
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(ids) == 0 {
		http.Error(w, "No IDs provided", http.StatusBadRequest)
		return
	}

	// 2. Start Transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to start database transaction").Error(), http.StatusInternalServerError)
		return
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// 3. Loop through IDs and Delete
	query := "DELETE FROM devices WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			http.Error(w, pkgutils.ErrorHandler(err, fmt.Sprintf("Error deleting device ID %v", id)).Error(), http.StatusInternalServerError)
			return // Triggers rollback
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			// Option: Fail entire batch if one is missing, OR accept it.
			// For strict middleware/API consistency, often it's better to fail or warn.
			// Here we will choose to fail to ensure data consistency as requested by "like BulkPatch".
			http.Error(w, fmt.Sprintf("Device ID %v not found", id), http.StatusNotFound)
			return // Triggers rollback
		}
	}

	// 4. Commit Transaction
	err = tx.Commit()
	if err != nil {
		http.Error(w, pkgutils.ErrorHandler(err, "Failed to commit transaction").Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}
