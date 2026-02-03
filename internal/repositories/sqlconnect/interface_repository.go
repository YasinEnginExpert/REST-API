package sqlconnect

import (
	"database/sql"
	"fmt"
	"restapi/internal/models"
	"restapi/internal/utils"
	"strings"
)

type InterfaceRepository struct {
	DB *sql.DB
}

func NewInterfaceRepository(db *sql.DB) *InterfaceRepository {
	return &InterfaceRepository{DB: db}
}

// Removed updated_at to match init.sql schema

func (r *InterfaceRepository) GetAll(filters map[string]string, sorts []string) ([]models.Interface, error) {
	query, args := r.filterInterfaces(filters)
	query = r.addInterfaceSorting(query, sorts)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var interfaces []models.Interface
	for rows.Next() {
		var i models.Interface
		var description, macAddress, speed, deviceID, createdAt sql.NullString
		if err := rows.Scan(&i.ID, &i.Name, &i.Type, &description, &macAddress, &speed, &i.Status, &deviceID, &createdAt); err != nil {
			return nil, err
		}
		i.Description = description.String
		i.MACAddress = macAddress.String
		i.Speed = speed.String
		i.DeviceID = deviceID.String
		i.CreatedAt = createdAt.String
		// i.UpdatedAt = updatedAt.String // Removed
		interfaces = append(interfaces, i)
	}
	return interfaces, nil
}

func (r *InterfaceRepository) GetByID(id string) (*models.Interface, error) {
	var i models.Interface
	var description, macAddress, speed, deviceID, createdAt sql.NullString

	query := "SELECT id, name, type, description, mac_address, speed, status, device_id, created_at FROM interfaces WHERE id = $1"
	err := r.DB.QueryRow(query, id).Scan(&i.ID, &i.Name, &i.Type, &description, &macAddress, &speed, &i.Status, &deviceID, &createdAt)
	if err != nil {
		return nil, err
	}

	i.Description = description.String
	i.MACAddress = macAddress.String
	i.Speed = speed.String
	i.DeviceID = deviceID.String
	i.CreatedAt = createdAt.String
	// i.UpdatedAt = updatedAt.String

	return &i, nil
}

func (r *InterfaceRepository) Create(i models.Interface) (*models.Interface, error) {
	data, err := utils.GetStructValues(i)
	if err != nil {
		return nil, err
	}
	query, args, err := utils.GenerateInsertQuery("interfaces", data)
	if err != nil {
		return nil, err
	}

	err = r.DB.QueryRow(query, args...).Scan(&i.ID)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *InterfaceRepository) Update(i models.Interface) (int64, error) {
	query := `UPDATE interfaces SET name=$1, type=$2, description=$3, mac_address=$4, speed=$5, status=$6, device_id=$7 
			  WHERE id=$8`

	res, err := r.DB.Exec(query, i.Name, i.Type, i.Description, i.MACAddress, i.Speed, i.Status, i.DeviceID, i.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *InterfaceRepository) Delete(id string) (int64, error) {
	query := "DELETE FROM interfaces WHERE id = $1"
	res, err := r.DB.Exec(query, id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *InterfaceRepository) Patch(id string, updates map[string]interface{}, allowedFields map[string]bool) (int64, error) {
	query, args, err := utils.BuildUpdateQuery("interfaces", updates, allowedFields, id)
	if err != nil {
		return 0, err
	}

	// Inject updated_at - REMOVED for interfaces
	// query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

	res, err := r.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *InterfaceRepository) BulkPatch(updates []map[string]interface{}, allowedFields map[string]bool) error {
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

		query, args, err := utils.BuildUpdateQuery("interfaces", item, allowedFields, id)
		if err != nil {
			continue
		}

		// Inject updated_at - REMOVED
		// query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

		_, err = tx.Exec(query, args...)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *InterfaceRepository) BulkDelete(ids []string) error {
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

	query := "DELETE FROM interfaces WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			return err
		}
		rows, _ := res.RowsAffected()
		if rows == 0 {
			return fmt.Errorf("interface ID %v not found", id)
		}
	}
	return tx.Commit()
}

func (r *InterfaceRepository) GetCountByDeviceID(deviceID string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM interfaces WHERE device_id = $1`
	err := r.DB.QueryRow(query, deviceID).Scan(&count)
	return count, err
}

// Helpers

func (r *InterfaceRepository) filterInterfaces(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, name, type, description, mac_address, speed, status, device_id, created_at FROM interfaces WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"name":        "name",
		"type":        "type",
		"description": "description",
		"mac_address": "mac_address",
		"speed":       "speed",
		"status":      "status",
		"device_id":   "device_id",
		"created_at":  "created_at",
		// "updated_at":  "updated_at",
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

func (r *InterfaceRepository) addInterfaceSorting(query string, sorts []string) string {
	if len(sorts) == 0 {
		return query
	}

	allowedParams := map[string]bool{
		"name":        true,
		"type":        true,
		"description": true,
		"mac_address": true,
		"speed":       true,
		"status":      true,
		"device_id":   true,
		"created_at":  true,
		// "updated_at":  true,
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
