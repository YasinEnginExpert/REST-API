package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/utils"
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

	// 1. Build Query
	query, args := FilterInterfaces(filters)

	// 2. Add Sorting
	sorts := r.URL.Query()["sortby"]
	query = AddInterfaceSorting(query, sorts)

	// 3. Execute
	interfaces, err := SelectInterfaces(query, args)
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

// FilterInterfaces builds the SQL query based on filters
func FilterInterfaces(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, device_id, name, ip_address, mac_address, speed, type, description, status FROM interfaces WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"device_id":   "device_id",
		"name":        "name",
		"ip_address":  "ip_address",
		"mac_address": "mac_address",
		"speed":       "speed",
		"type":        "type",
		"description": "description",
		"status":      "status",
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

// AddInterfaceSorting appends ORDER BY clauses
func AddInterfaceSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"device_id":   true,
		"name":        true,
		"ip_address":  true,
		"mac_address": true,
		"speed":       true,
		"type":        true,
		"description": true,
		"status":      true,
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

// SelectInterfaces executes the query
func SelectInterfaces(query string, args []interface{}) ([]models.Interface, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var interfaces []models.Interface
	for rows.Next() {
		var i models.Interface
		var ipAddress, macAddress, speed, typeStr, description sql.NullString

		err := rows.Scan(&i.ID, &i.DeviceID, &i.Name, &ipAddress, &macAddress, &speed, &typeStr, &description, &i.Status)
		if err != nil {
			return nil, err
		}

		i.IPAddress = ipAddress.String
		i.MACAddress = macAddress.String
		i.Speed = speed.String
		i.Type = typeStr.String
		i.Description = description.String

		interfaces = append(interfaces, i)
	}
	return interfaces, nil
}

// GetInterface handles GET requests for a single interface
func GetInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var i models.Interface
	var ipAddress, macAddress, speed, typeStr, description sql.NullString

	query := "SELECT id, device_id, name, ip_address, mac_address, speed, type, description, status FROM interfaces WHERE id=$1"
	err := db.QueryRow(query, id).Scan(&i.ID, &i.DeviceID, &i.Name, &ipAddress, &macAddress, &speed, &typeStr, &description, &i.Status)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch interface").Error(), http.StatusInternalServerError)
		return
	}

	i.IPAddress = ipAddress.String
	i.MACAddress = macAddress.String
	i.Speed = speed.String
	i.Type = typeStr.String
	i.Description = description.String

	json.NewEncoder(w).Encode(i)
}

// CreateInterface handles POST requests
func CreateInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var i models.Interface
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&i); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate interface data
	if err := i.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Map data for insert
	data, err := utils.GetStructValues(i)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to parse interface data").Error(), http.StatusInternalServerError)
		return
	}

	query, args, err := utils.GenerateInsertQuery("interfaces", data)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to generate insert query").Error(), http.StatusInternalServerError)
		return
	}

	err = db.QueryRow(query, args...).Scan(&i.ID)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create interface").Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(i)
}

// UpdateInterface handles PUT requests
func UpdateInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var i models.Interface
	// Strict JSON decoding
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&i); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate interface data
	if err := i.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `UPDATE interfaces SET device_id=$1, name=$2, ip_address=$3, mac_address=$4, speed=$5, type=$6, description=$7, status=$8 
			  WHERE id=$9`

	res, err := db.Exec(query, i.DeviceID, i.Name, i.IPAddress, i.MACAddress, i.Speed, i.Type, i.Description, i.Status, id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update interface").Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}
	i.ID = id
	json.NewEncoder(w).Encode(i)
}

// DeleteInterface handles DELETE requests
func DeleteInterface(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	res, err := db.Exec("DELETE FROM interfaces WHERE id=$1", id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete interface").Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// PatchInterface handles PATCH requests (Partial Update)
func PatchInterface(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	allowedFields := map[string]bool{
		"device_id":   true,
		"name":        true,
		"ip_address":  true,
		"mac_address": true,
		"speed":       true,
		"type":        true,
		"description": true,
		"status":      true,
	}

	// VALIDATION
	if val, ok := updates["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		pkgutils.JSONError(w, "name cannot be empty", http.StatusBadRequest)
		return
	}
	if val, ok := updates["ip_address"]; ok {
		ipStr := fmt.Sprintf("%v", val)
		if ipStr != "" && net.ParseIP(ipStr) == nil {
			pkgutils.JSONError(w, "invalid ip_address format", http.StatusBadRequest)
			return
		}
	}
	if val, ok := updates["mac_address"]; ok {
		macStr := fmt.Sprintf("%v", val)
		if macStr != "" {
			if _, err := net.ParseMAC(macStr); err != nil {
				pkgutils.JSONError(w, "invalid mac_address format", http.StatusBadRequest)
				return
			}
		}
	}
	if val, ok := updates["type"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
		pkgutils.JSONError(w, "type cannot be empty", http.StatusBadRequest)
		return
	}
	if val, ok := updates["status"]; ok {
		status := strings.ToLower(fmt.Sprintf("%v", val))
		validStatuses := map[string]bool{"up": true, "down": true, "administratively down": true}
		if !validStatuses[status] {
			pkgutils.JSONError(w, "invalid status", http.StatusBadRequest)
			return
		}
	}

	query, args, err := utils.BuildUpdateQuery("interfaces", updates, allowedFields, id)
	if err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.Exec(query, args...)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to patch interface").Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Interface not found", http.StatusNotFound)
		return
	}

	// Fetch updated interface to return
	var i models.Interface
	var ipAddress, macAddress, speed, typeStr, description sql.NullString

	fetchQuery := "SELECT id, device_id, name, ip_address, mac_address, speed, type, description, status FROM interfaces WHERE id=$1"
	err = db.QueryRow(fetchQuery, id).Scan(&i.ID, &i.DeviceID, &i.Name, &ipAddress, &macAddress, &speed, &typeStr, &description, &i.Status)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch updated interface").Error(), http.StatusInternalServerError)
		return
	}

	i.IPAddress = ipAddress.String
	i.MACAddress = macAddress.String
	i.Speed = speed.String
	i.Type = typeStr.String
	i.Description = description.String

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

	tx, err := db.Begin()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to start database transaction").Error(), http.StatusInternalServerError)
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

	allowedFields := map[string]bool{
		"device_id":   true,
		"name":        true,
		"ip_address":  true,
		"mac_address": true,
		"speed":       true,
		"type":        true,
		"description": true,
		"status":      true,
	}

	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			pkgutils.JSONError(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		// VALIDATION
		if val, ok := item["name"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
			pkgutils.JSONError(w, fmt.Sprintf("name cannot be empty for interface %v", id), http.StatusBadRequest)
			return
		}
		if val, ok := item["type"]; ok && strings.TrimSpace(fmt.Sprintf("%v", val)) == "" {
			pkgutils.JSONError(w, fmt.Sprintf("type cannot be empty for interface %v", id), http.StatusBadRequest)
			return
		}
		if val, ok := item["ip_address"]; ok {
			ipStr := fmt.Sprintf("%v", val)
			if ipStr != "" && net.ParseIP(ipStr) == nil {
				pkgutils.JSONError(w, fmt.Sprintf("invalid ip_address format for interface %v", id), http.StatusBadRequest)
				return
			}
		}
		if val, ok := item["mac_address"]; ok {
			macStr := fmt.Sprintf("%v", val)
			if macStr != "" {
				if _, err := net.ParseMAC(macStr); err != nil {
					pkgutils.JSONError(w, fmt.Sprintf("invalid mac_address format for interface %v", id), http.StatusBadRequest)
					return
				}
			}
		}

		query, args, err := utils.BuildUpdateQuery("interfaces", item, allowedFields, id)
		if err != nil {
			// Skip this item if no valid fields update, similar to previous logic
			continue
		}

		_, err = tx.Exec(query, args...)
		if err != nil {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, fmt.Sprintf("Error updating interface ID %v", id)).Error(), http.StatusInternalServerError)
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to commit transaction").Error(), http.StatusInternalServerError)
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

	tx, err := db.Begin()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to start database transaction").Error(), http.StatusInternalServerError)
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

	query := "DELETE FROM interfaces WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, fmt.Sprintf("Error deleting interface ID %v", id)).Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			pkgutils.JSONError(w, fmt.Sprintf("Interface ID %v not found", id), http.StatusNotFound)
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to commit transaction").Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk delete completed successfully"}`))
}

// GetInterfacesByDevice handles GET requests for interfaces on a specific device
// Route: /devices/{id}/interfaces
func GetInterfacesByDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	deviceID := vars["id"]

	// Reuse existing filter logic
	filters := map[string]string{
		"device_id": deviceID,
	}

	// 1. Build Query
	query, args := FilterInterfaces(filters)

	// 2. Add Sorting
	sorts := r.URL.Query()["sortby"]
	query = AddInterfaceSorting(query, sorts)

	// 3. Execute
	interfaces, err := SelectInterfaces(query, args)
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
