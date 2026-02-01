package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/utils"
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
		http.Error(w, "Interface not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, description, status) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`

	err := db.QueryRow(query, i.DeviceID, i.Name, i.IPAddress, i.MACAddress, i.Speed, i.Type, i.Description, i.Status).Scan(&i.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	query := `UPDATE interfaces SET device_id=$1, name=$2, ip_address=$3, mac_address=$4, speed=$5, type=$6, description=$7, status=$8 
			  WHERE id=$9`

	res, err := db.Exec(query, i.DeviceID, i.Name, i.IPAddress, i.MACAddress, i.Speed, i.Type, i.Description, i.Status, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Interface not found", http.StatusNotFound)
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Interface not found", http.StatusNotFound)
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
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
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

	query, args, err := utils.BuildUpdateQuery("interfaces", updates, allowedFields, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Interface not found", http.StatusNotFound)
		return
	}

	// Fetch updated interface to return
	var i models.Interface
	var ipAddress, macAddress, speed, typeStr, description sql.NullString

	fetchQuery := "SELECT id, device_id, name, ip_address, mac_address, speed, type, description, status FROM interfaces WHERE id=$1"
	err = db.QueryRow(fetchQuery, id).Scan(&i.ID, &i.DeviceID, &i.Name, &ipAddress, &macAddress, &speed, &typeStr, &description, &i.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if len(updates) == 0 {
		http.Error(w, "No updates provided", http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
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
			http.Error(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		query, args, err := utils.BuildUpdateQuery("interfaces", item, allowedFields, id)
		if err != nil {
			// Skip this item if no valid fields update, similar to previous logic
			continue
		}

		_, err = tx.Exec(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating interface ID %v: %v", id, err), http.StatusInternalServerError)
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		http.Error(w, "Error committing transaction", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status": "success", "message": "Bulk update completed successfully"}`))
}
