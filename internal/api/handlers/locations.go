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

// GetLocations handles GET requests for listing locations with optional filtering
func GetLocations(w http.ResponseWriter, r *http.Request) {
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
	query, args := FilterLocations(filters)

	// 2. Add Sorting
	sorts := r.URL.Query()["sortby"]
	query = AddLocationSorting(query, sorts)

	// 3. Execute Query
	locations, err := SelectLocations(query, args)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Status string            `json:"status"`
		Count  int               `json:"count"`
		Data   []models.Location `json:"data"`
	}{
		Status: "success",
		Count:  len(locations),
		Data:   locations,
	}

	json.NewEncoder(w).Encode(response)
}

// FilterLocations builds the SQL query based on filters
func FilterLocations(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, name, city, country, address, created_at FROM locations WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"name":    "name",
		"city":    "city",
		"country": "country",
		"address": "address",
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

// AddLocationSorting appends ORDER BY clauses to the query
func AddLocationSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"name":       true,
		"city":       true,
		"country":    true,
		"address":    true,
		"created_at": true,
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

// SelectLocations executes the query and returns location list
func SelectLocations(query string, args []interface{}) ([]models.Location, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []models.Location
	for rows.Next() {
		var l models.Location
		var address, createdAt sql.NullString
		if err := rows.Scan(&l.ID, &l.Name, &l.City, &l.Country, &address, &createdAt); err != nil {
			return nil, err
		}
		l.Address = address.String
		l.CreatedAt = createdAt.String
		locations = append(locations, l)
	}
	return locations, nil
}

// CreateLocation handles POST requests
func CreateLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var l models.Location
	if err := json.NewDecoder(r.Body).Decode(&l); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	err := db.QueryRow("INSERT INTO locations (name, city, country, address) VALUES ($1, $2, $3, $4) RETURNING id",
		l.Name, l.City, l.Country, l.Address).Scan(&l.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(l)
}

// GetLocation handles GET Single Location
func GetLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var l models.Location
	var address, createdAt sql.NullString
	err := db.QueryRow("SELECT id, name, city, country, address, created_at FROM locations WHERE id=$1", id).
		Scan(&l.ID, &l.Name, &l.City, &l.Country, &address, &createdAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	l.Address = address.String
	l.CreatedAt = createdAt.String

	json.NewEncoder(w).Encode(l)
}

// UpdateLocation handles PUT requests
func UpdateLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var l models.Location
	if err := json.NewDecoder(r.Body).Decode(&l); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	query := "UPDATE locations SET name=$1, city=$2, country=$3, address=$4 WHERE id=$5"
	res, err := db.Exec(query, l.Name, l.City, l.Country, l.Address, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}
	l.ID = id
	json.NewEncoder(w).Encode(l)
}

// DeleteLocation handles DELETE requests
func DeleteLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	res, err := db.Exec("DELETE FROM locations WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// PatchLocation handles PATCH requests (Partial Update)
func PatchLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	allowedFields := map[string]bool{
		"name":    true,
		"city":    true,
		"country": true,
		"address": true,
	}

	query, args, err := utils.BuildUpdateQuery("locations", updates, allowedFields, id)
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
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}

	// Fetch updated location to return
	var l models.Location
	var address, createdAt sql.NullString
	fetchQuery := "SELECT id, name, city, country, address, created_at FROM locations WHERE id=$1"
	err = db.QueryRow(fetchQuery, id).Scan(&l.ID, &l.Name, &l.City, &l.Country, &address, &createdAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	l.Address = address.String
	l.CreatedAt = createdAt.String

	json.NewEncoder(w).Encode(l)
}

// BulkPatchLocations handles updating multiple locations at once
func BulkPatchLocations(w http.ResponseWriter, r *http.Request) {
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
		"name":    true,
		"city":    true,
		"country": true,
		"address": true,
	}

	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			http.Error(w, "Missing ID in one of the update items", http.StatusBadRequest)
			return
		}

		query, args, err := utils.BuildUpdateQuery("locations", item, allowedFields, id)
		if err != nil {
			// Skip invalid items like before
			continue
		}

		_, err = tx.Exec(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating location ID %v: %v", id, err), http.StatusInternalServerError)
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
