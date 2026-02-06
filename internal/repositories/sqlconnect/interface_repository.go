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

func (r *InterfaceRepository) GetAll(filters map[string]string, sorts []string, limit int, offset int) ([]models.Interface, error) {
	query, args := r.filterInterfaces(filters)
	query = r.addInterfaceSorting(query, sorts)

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var interfaces []models.Interface
	for rows.Next() {
		var i models.Interface
		var description, macAddress, speed, deviceID, adminStatus, operStatus, mode, ipAddress sql.NullString
		var createdAt, updatedAt sql.NullTime
		var ifIndex, mtu, speedMbps sql.NullInt64

		if err := rows.Scan(&i.ID, &i.Name, &i.Type, &description, &macAddress, &speed, &i.Status, &deviceID, &createdAt, &updatedAt, &adminStatus, &operStatus, &ifIndex, &mtu, &mode, &ipAddress, &speedMbps); err != nil {
			return nil, err
		}
		i.Description = description.String
		i.MACAddress = macAddress.String
		i.Speed = speed.String
		i.DeviceID = deviceID.String
		i.CreatedAt = formatNullTime(createdAt)
		i.UpdatedAt = formatNullTime(updatedAt)
		i.AdminStatus = adminStatus.String
		i.OperStatus = operStatus.String
		i.Mode = mode.String
		i.IPAddress = ipAddress.String
		if ifIndex.Valid {
			val := int(ifIndex.Int64)
			i.IfIndex = &val
		}
		if mtu.Valid {
			val := int(mtu.Int64)
			i.MTU = &val
		}
		if speedMbps.Valid {
			val := int(speedMbps.Int64)
			i.SpeedMbps = &val
		}
		interfaces = append(interfaces, i)
	}
	return interfaces, nil
}

func (r *InterfaceRepository) Count(filters map[string]string) (int, error) {
	// Rebuild query and args to be 100% robust and independent of GetAll's SELECT list
	query := "SELECT COUNT(*) FROM interfaces WHERE 1=1"
	var args []interface{}
	var argId = 1

	allowedParams := map[string]string{
		"name":         "name",
		"type":         "type",
		"mac_address":  "mac_address",
		"speed":        "speed",
		"status":       "status",
		"device_id":    "device_id",
		"admin_status": "admin_status",
		"oper_status":  "oper_status",
		"mode":         "mode",
		"ip_address":   "ip_address",
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

func (r *InterfaceRepository) GetByID(id string) (*models.Interface, error) {
	var i models.Interface
	var description, macAddress, speed, deviceID, adminStatus, operStatus, mode, ipAddress sql.NullString
	var createdAt, updatedAt sql.NullTime
	var ifIndex, mtu, speedMbps sql.NullInt64

	query := "SELECT id, name, type, description, mac_address, speed, status, device_id, created_at, updated_at, admin_status, oper_status, ifindex, mtu, mode, ip_address, speed_mbps FROM interfaces WHERE id = $1"
	err := r.DB.QueryRow(query, id).Scan(&i.ID, &i.Name, &i.Type, &description, &macAddress, &speed, &i.Status, &deviceID, &createdAt, &updatedAt, &adminStatus, &operStatus, &ifIndex, &mtu, &mode, &ipAddress, &speedMbps)
	if err != nil {
		return nil, err
	}

	i.Description = description.String
	i.MACAddress = macAddress.String
	i.Speed = speed.String
	i.DeviceID = deviceID.String
	i.CreatedAt = formatNullTime(createdAt)
	i.UpdatedAt = formatNullTime(updatedAt)
	i.AdminStatus = adminStatus.String
	i.OperStatus = operStatus.String
	i.Mode = mode.String
	i.IPAddress = ipAddress.String
	if ifIndex.Valid {
		val := int(ifIndex.Int64)
		i.IfIndex = &val
	}
	if mtu.Valid {
		val := int(mtu.Int64)
		i.MTU = &val
	}
	if speedMbps.Valid {
		val := int(speedMbps.Int64)
		i.SpeedMbps = &val
	}

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
	query := `UPDATE interfaces SET name=$1, type=$2, description=$3, mac_address=$4, speed=$5, status=$6, device_id=$7, admin_status=$8, oper_status=$9, ifindex=$10, mtu=$11, mode=$12, ip_address=$13, speed_mbps=$14, updated_at=CURRENT_TIMESTAMP
			  WHERE id=$15`

	var ifIndex sql.NullInt64
	if i.IfIndex != nil {
		ifIndex = sql.NullInt64{Int64: int64(*i.IfIndex), Valid: true}
	}
	var mtu sql.NullInt64
	if i.MTU != nil {
		mtu = sql.NullInt64{Int64: int64(*i.MTU), Valid: true}
	}
	var speedMbps sql.NullInt64
	if i.SpeedMbps != nil {
		speedMbps = sql.NullInt64{Int64: int64(*i.SpeedMbps), Valid: true}
	}

	res, err := r.DB.Exec(query, i.Name, i.Type, i.Description, i.MACAddress, i.Speed, i.Status, i.DeviceID, i.AdminStatus, i.OperStatus, ifIndex, mtu, i.Mode, i.IPAddress, speedMbps, i.ID)
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

	// Inject updated_at
	query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

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

		// Inject updated_at
		query = strings.Replace(query, " WHERE", ", updated_at=CURRENT_TIMESTAMP WHERE", 1)

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
	query := "SELECT id, name, type, description, mac_address, speed, status, device_id, created_at, updated_at, admin_status, oper_status, ifindex, mtu, mode, ip_address, speed_mbps FROM interfaces WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"name":         "name",
		"type":         "type",
		"description":  "description",
		"mac_address":  "mac_address",
		"speed":        "speed",
		"status":       "status",
		"device_id":    "device_id",
		"created_at":   "created_at",
		"admin_status": "admin_status",
		"oper_status":  "oper_status",
		"ifindex":      "ifindex",
		"mtu":          "mtu",
		"mode":         "mode",
		"ip_address":   "ip_address",
		"speed_mbps":   "speed_mbps",
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
		"name":         true,
		"type":         true,
		"description":  true,
		"mac_address":  true,
		"speed":        true,
		"status":       true,
		"device_id":    true,
		"created_at":   true,
		"admin_status": true,
		"oper_status":  true,
		"ifindex":      true,
		"mtu":          true,
		"mode":         true,
		"ip_address":   true,
		"speed_mbps":   true,
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
