package sqlconnect

import (
	"database/sql"
	"fmt"
	"restapi/internal/models"
	"restapi/internal/utils"
	"strings"
	"time"
)

type DeviceRepository struct {
	DB *sql.DB
}

func NewDeviceRepository(db *sql.DB) *DeviceRepository {
	return &DeviceRepository{DB: db}
}

func (r *DeviceRepository) GetAll(filters map[string]string, sorts []string, limit int, offset int) ([]models.Device, error) {
	query, args := r.filterDevices(filters)
	query = r.addDeviceSorting(query, sorts)

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []models.Device
	for rows.Next() {
		var d models.Device
		var serialNumber, rackPosition, locationID, osVersion, role, notes sql.NullString
		var createdAt, updatedAt, lastSeen sql.NullTime

		err := rows.Scan(&d.ID, &d.Hostname, &d.IP, &d.Model, &d.Vendor, &d.OS, &serialNumber, &d.Status, &rackPosition, &locationID, &createdAt, &updatedAt, &osVersion, &role, &lastSeen, &d.Tags, &notes)
		if err != nil {
			return nil, err
		}

		d.SerialNumber = serialNumber.String
		d.RackPosition = rackPosition.String
		d.LocationID = locationID.String
		d.CreatedAt = formatNullTime(createdAt)
		d.UpdatedAt = formatNullTime(updatedAt)
		d.OSVersion = osVersion.String
		d.Role = role.String
		d.LastSeen = formatNullTime(lastSeen)
		d.Notes = notes.String

		devices = append(devices, d)
	}
	return devices, nil
}

func (r *DeviceRepository) Count(filters map[string]string) (int, error) {
	// Rebuild query and args to be 100% robust and independent of GetAll's SELECT list
	query := "SELECT COUNT(*) FROM devices WHERE 1=1"
	var args []interface{}
	var argId = 1

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
		"os_version":    "os_version",
		"role":          "role",
		"last_seen":     "last_seen",
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

func (r *DeviceRepository) GetByID(id string) (*models.Device, error) {
	var d models.Device
	var serialNumber, rackPosition, locationID, osVersion, role, notes sql.NullString
	var createdAt, updatedAt, lastSeen sql.NullTime

	query := "SELECT id, hostname, ip, model, vendor, os, serial_number, status, rack_position, location_id, created_at, updated_at, os_version, role, last_seen, tags, notes FROM devices WHERE id = $1"
	err := r.DB.QueryRow(query, id).Scan(&d.ID, &d.Hostname, &d.IP, &d.Model, &d.Vendor, &d.OS, &serialNumber, &d.Status, &rackPosition, &locationID, &createdAt, &updatedAt, &osVersion, &role, &lastSeen, &d.Tags, &notes)
	if err != nil {
		return nil, err
	}

	d.SerialNumber = serialNumber.String
	d.RackPosition = rackPosition.String
	d.LocationID = locationID.String
	d.CreatedAt = formatNullTime(createdAt)
	d.UpdatedAt = formatNullTime(updatedAt)
	d.OSVersion = osVersion.String
	d.Role = role.String
	d.LastSeen = formatNullTime(lastSeen)
	d.Notes = notes.String

	return &d, nil
}

func (r *DeviceRepository) Create(d models.Device) (*models.Device, error) {
	data, err := utils.GetStructValues(d)
	if err != nil {
		return nil, err
	}

	query, args, err := utils.GenerateInsertQuery("devices", data)
	if err != nil {
		return nil, err
	}

	err = r.DB.QueryRow(query, args...).Scan(&d.ID)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *DeviceRepository) Update(d models.Device) (int64, error) {
	query := `UPDATE devices SET hostname=$1, ip=$2, model=$3, vendor=$4, os=$5, serial_number=$6, status=$7, rack_position=$8, location_id=$9, os_version=$10, role=$11, last_seen=$12, tags=$13, notes=$14, updated_at=CURRENT_TIMESTAMP 
			  WHERE id=$15`

	var lastSeen sql.NullTime
	if d.LastSeen != "" {
		t, err := time.Parse(time.RFC3339Nano, d.LastSeen)
		if err == nil {
			lastSeen = sql.NullTime{Time: t, Valid: true}
		}
	}

	res, err := r.DB.Exec(query, d.Hostname, d.IP, d.Model, d.Vendor, d.OS, d.SerialNumber, d.Status, d.RackPosition, d.LocationID, d.OSVersion, d.Role, lastSeen, d.Tags, d.Notes, d.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *DeviceRepository) Delete(id string) (int64, error) {
	query := "DELETE FROM devices WHERE id = $1"
	res, err := r.DB.Exec(query, id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *DeviceRepository) Patch(id string, updates map[string]interface{}, allowedFields map[string]bool) (int64, error) {
	query, args, err := utils.BuildUpdateQuery("devices", updates, allowedFields, id)
	if err != nil {
		return 0, err
	}

	// Inject updated_at=CURRENT_TIMESTAMP
	query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

	res, err := r.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *DeviceRepository) BulkPatch(updates []map[string]interface{}, allowedFields map[string]bool) error {
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

		query, args, err := utils.BuildUpdateQuery("devices", item, allowedFields, id)
		if err != nil {
			continue
		}

		// Inject updated_at
		query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

		_, err = tx.Exec(query, args...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *DeviceRepository) BulkDelete(ids []string) error {
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

	query := "DELETE FROM devices WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			return err
		}

		rows, _ := res.RowsAffected()
		if rows == 0 {
			return fmt.Errorf("device ID %v not found", id)
		}
	}

	return tx.Commit()
}

func (r *DeviceRepository) GetInterfaceCount(deviceID string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM interfaces WHERE device_id = $1`
	err := r.DB.QueryRow(query, deviceID).Scan(&count)
	return count, err
}

// Helpers

func (r *DeviceRepository) filterDevices(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, hostname, ip, model, vendor, os, serial_number, status, rack_position, location_id, created_at, updated_at, os_version, role, last_seen, tags, notes FROM devices WHERE 1=1"
	var args []interface{}
	argId := 1

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
		"os_version":    "os_version",
		"role":          "role",
		"last_seen":     "last_seen",
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

func (r *DeviceRepository) addDeviceSorting(query string, sorts []string) string {
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
		"os_version":    true,
		"role":          true,
		"last_seen":     true,
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
