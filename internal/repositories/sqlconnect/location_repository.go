package sqlconnect

import (
	"database/sql"
	"fmt"
	"restapi/internal/models"
	"restapi/internal/utils"
	"strings"
)

type LocationRepository struct {
	DB *sql.DB
}

func NewLocationRepository(db *sql.DB) *LocationRepository {
	return &LocationRepository{DB: db}
}

func (r *LocationRepository) GetAll(filters map[string]string, sorts []string, limit int, offset int) ([]models.Location, error) {
	query, args := r.filterLocations(filters)
	query = r.addLocationSorting(query, sorts)

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []models.Location
	for rows.Next() {
		var l models.Location
		var address, siteCode, timezone sql.NullString
		var createdAt, updatedAt sql.NullTime
		var lat, lon sql.NullFloat64
		if err := rows.Scan(&l.ID, &l.Name, &l.City, &l.Country, &address, &siteCode, &timezone, &lat, &lon, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		l.Address = address.String
		l.CreatedAt = formatNullTime(createdAt)
		l.SiteCode = siteCode.String
		l.Timezone = timezone.String
		l.UpdatedAt = formatNullTime(updatedAt)
		if lat.Valid {
			l.Lat = &lat.Float64
		}
		if lon.Valid {
			l.Lon = &lon.Float64
		}
		locations = append(locations, l)
	}
	return locations, nil
}

func (r *LocationRepository) Count(filters map[string]string) (int, error) {
	// Rebuild query and args to be 100% robust and independent of GetAll's SELECT list
	query := "SELECT COUNT(*) FROM locations WHERE 1=1"
	var args []interface{}
	var argId = 1

	allowedParams := map[string]string{
		"name":      "name",
		"city":      "city",
		"country":   "country",
		"address":   "address",
		"site_code": "site_code",
		"timezone":  "timezone",
	}

	for param, value := range filters {
		if dbField, ok := allowedParams[param]; ok {
			query += fmt.Sprintf(" AND %s = $%d", dbField, argId)
			args = append(args, value)
			argId++
		}
	}

	var count int
	err := r.DB.QueryRow(query, args...).Scan(&count)
	return count, err
}

func (r *LocationRepository) GetByID(id string) (*models.Location, error) {
	var l models.Location
	var address, siteCode, timezone sql.NullString
	var createdAt, updatedAt sql.NullTime
	var lat, lon sql.NullFloat64

	err := r.DB.QueryRow("SELECT id, name, city, country, address, site_code, timezone, lat, lon, created_at, updated_at FROM locations WHERE id=$1", id).
		Scan(&l.ID, &l.Name, &l.City, &l.Country, &address, &siteCode, &timezone, &lat, &lon, &createdAt, &updatedAt)

	if err != nil {
		return nil, err
	}
	l.Address = address.String
	l.CreatedAt = formatNullTime(createdAt)
	l.UpdatedAt = formatNullTime(updatedAt)
	l.SiteCode = siteCode.String
	l.Timezone = timezone.String
	if lat.Valid {
		l.Lat = &lat.Float64
	}
	if lon.Valid {
		l.Lon = &lon.Float64
	}
	return &l, nil
}

func (r *LocationRepository) Create(l models.Location) (*models.Location, error) {
	data, err := utils.GetStructValues(l)
	if err != nil {
		return nil, err
	}
	delete(data, "created_at")
	delete(data, "updated_at")

	query, args, err := utils.GenerateInsertQuery("locations", data)
	if err != nil {
		return nil, err
	}

	err = r.DB.QueryRow(query, args...).Scan(&l.ID)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *LocationRepository) Update(l models.Location) (int64, error) {
	query := "UPDATE locations SET name=$1, city=$2, country=$3, address=$4, site_code=$5, timezone=$6, lat=$7, lon=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9"
	var siteCode sql.NullString
	if l.SiteCode != "" {
		siteCode = sql.NullString{String: l.SiteCode, Valid: true}
	}
	var timezone sql.NullString
	if l.Timezone != "" {
		timezone = sql.NullString{String: l.Timezone, Valid: true}
	}
	var lat sql.NullFloat64
	if l.Lat != nil {
		lat = sql.NullFloat64{Float64: *l.Lat, Valid: true}
	}
	var lon sql.NullFloat64
	if l.Lon != nil {
		lon = sql.NullFloat64{Float64: *l.Lon, Valid: true}
	}

	res, err := r.DB.Exec(query, l.Name, l.City, l.Country, l.Address, siteCode, timezone, lat, lon, l.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *LocationRepository) Patch(id string, updates map[string]interface{}, allowedFields map[string]bool) (int64, error) {
	query, args, err := utils.BuildUpdateQuery("locations", updates, allowedFields, id)
	if err != nil {
		return 0, err
	}
	res, err := r.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()

}

func (r *LocationRepository) Delete(id string) (int64, error) {
	res, err := r.DB.Exec("DELETE FROM locations WHERE id=$1", id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *LocationRepository) BulkPatch(updates []map[string]interface{}, allowedFields map[string]bool) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	for _, item := range updates {
		id, ok := item["id"]
		if !ok {
			return fmt.Errorf("missing ID in update item")
		}

		query, args, err := utils.BuildUpdateQuery("locations", item, allowedFields, id)
		if err != nil {
			continue
		}

		_, err = tx.Exec(query, args...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *LocationRepository) BulkDelete(ids []string) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	query := "DELETE FROM locations WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			return err
		}
		rows, _ := res.RowsAffected()
		if rows == 0 {
			return fmt.Errorf("location ID %v not found", id)
		}
	}

	return tx.Commit()
}

func (r *LocationRepository) GetDeviceCount(locationID string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM devices WHERE location_id = $1`
	err := r.DB.QueryRow(query, locationID).Scan(&count)
	return count, err
}

// Helpers

func (r *LocationRepository) filterLocations(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, name, city, country, address, site_code, timezone, lat, lon, created_at, updated_at FROM locations WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"name":      "name",
		"city":      "city",
		"country":   "country",
		"address":   "address",
		"site_code": "site_code",
		"timezone":  "timezone",
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

func (r *LocationRepository) addLocationSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"name":       true,
		"city":       true,
		"country":    true,
		"address":    true,
		"created_at": true,
		"updated_at": true,
		"site_code":  true,
		"timezone":   true,
	}

	var orderClauses []string
	for _, sortParam := range sorts {
		parts := strings.Split(sortParam, ":")
		if len(parts) != 2 {
			continue
		}
		field, order := parts[0], parts[1]

		if allowedParams[field] && (order == "asc" || order == "desc") {
			orderClauses = append(orderClauses, fmt.Sprintf("%s %s", field, order))
		}
	}

	if len(orderClauses) > 0 {
		query += " ORDER BY " + strings.Join(orderClauses, ", ")
	}
	return query
}
