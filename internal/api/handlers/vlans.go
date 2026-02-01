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

// GetVLANs handles GET requests for listing VLANs with optional filtering
func GetVLANs(w http.ResponseWriter, r *http.Request) {
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
	query, args := FilterVLANs(filters)

	// 2. Add Sorting
	sorts := r.URL.Query()["sortby"]
	query = AddVLANSorting(query, sorts)

	// 3. Execute
	vlans, err := SelectVLANs(query, args)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string        `json:"status"`
		Count  int           `json:"count"`
		Data   []models.VLAN `json:"data"`
	}{
		Status: "success",
		Count:  len(vlans),
		Data:   vlans,
	}

	json.NewEncoder(w).Encode(response)
}

// FilterVLANs builds the SQL query based on filters
func FilterVLANs(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, vlan_id, name, description FROM vlans WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"vlan_id":     "vlan_id",
		"name":        "name",
		"description": "description",
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

// AddVLANSorting appends ORDER BY clauses
func AddVLANSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"vlan_id":     true,
		"name":        true,
		"description": true,
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

// SelectVLANs executes the query
func SelectVLANs(query string, args []interface{}) ([]models.VLAN, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vlans []models.VLAN
	for rows.Next() {
		var v models.VLAN
		var description sql.NullString
		if err := rows.Scan(&v.ID, &v.VlanID, &v.Name, &description); err != nil {
			return nil, err
		}
		v.Description = description.String
		vlans = append(vlans, v)
	}
	return vlans, nil
}

// CreateVLAN handles POST requests
func CreateVLAN(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var v models.VLAN
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	err := db.QueryRow("INSERT INTO vlans (vlan_id, name, description) VALUES ($1, $2, $3) RETURNING id",
		v.VlanID, v.Name, v.Description).Scan(&v.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(v)
}

// UpdateVLAN handles PUT requests
func UpdateVLAN(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var v models.VLAN
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	query := "UPDATE vlans SET vlan_id=$1, name=$2, description=$3 WHERE id=$4"
	res, err := db.Exec(query, v.VlanID, v.Name, v.Description, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "VLAN not found", http.StatusNotFound)
		return
	}
	v.ID = id
	json.NewEncoder(w).Encode(v)
}

// DeleteVLAN handles DELETE requests
func DeleteVLAN(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	res, err := db.Exec("DELETE FROM vlans WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "VLAN not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// PatchVLAN handles PATCH requests (Partial Update)
func PatchVLAN(w http.ResponseWriter, r *http.Request) {
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
		"vlan_id":     true,
		"name":        true,
		"description": true,
	}

	query, args, err := utils.BuildUpdateQuery("vlans", updates, allowedFields, id)
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
		http.Error(w, "VLAN not found", http.StatusNotFound)
		return
	}

	// Fetch updated vlan to return
	var v models.VLAN
	var description sql.NullString
	fetchQuery := "SELECT id, vlan_id, name, description FROM vlans WHERE id=$1"
	err = db.QueryRow(fetchQuery, id).Scan(&v.ID, &v.VlanID, &v.Name, &description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	v.Description = description.String
	json.NewEncoder(w).Encode(v)
}

// BulkPatchVLANs handles updating multiple VLANs at once
func BulkPatchVLANs(w http.ResponseWriter, r *http.Request) {
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
		"vlan_id":     true,
		"name":        true,
		"description": true,
	}

	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			http.Error(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		query, args, err := utils.BuildUpdateQuery("vlans", item, allowedFields, id)
		if err != nil {
			continue // Skip invalid item updates
		}

		_, err = tx.Exec(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating VLAN ID %v: %v", id, err), http.StatusInternalServerError)
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
