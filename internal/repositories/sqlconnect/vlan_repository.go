package sqlconnect

import (
	"database/sql"
	"fmt"
	"restapi/internal/models"
	"restapi/internal/utils"
	"strings"
)

type VLANRepository struct {
	DB *sql.DB
}

func NewVLANRepository(db *sql.DB) *VLANRepository {
	return &VLANRepository{DB: db}
}

func (r *VLANRepository) GetAll(filters map[string]string, sorts []string, limit int, offset int) ([]models.VLAN, error) {
	query, args := r.filterVLANs(filters)
	query = r.addVLANSorting(query, sorts)

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.DB.Query(query, args...)
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

func (r *VLANRepository) Count(filters map[string]string) (int, error) {
	query, args := r.filterVLANs(filters)
	countQuery := strings.Replace(query, "SELECT id, vlan_id, name, description FROM vlans", "SELECT COUNT(*)", 1)

	var count int
	err := r.DB.QueryRow(countQuery, args...).Scan(&count)
	return count, err
}

func (r *VLANRepository) GetByID(id string) (*models.VLAN, error) {
	var v models.VLAN
	var description sql.NullString
	query := "SELECT id, vlan_id, name, description FROM vlans WHERE id = $1"
	err := r.DB.QueryRow(query, id).Scan(&v.ID, &v.VlanID, &v.Name, &description)
	if err != nil {
		return nil, err
	}
	v.Description = description.String
	return &v, nil
}

func (r *VLANRepository) Create(v models.VLAN) (*models.VLAN, error) {
	data, err := utils.GetStructValues(v)
	if err != nil {
		return nil, err
	}
	query, args, err := utils.GenerateInsertQuery("vlans", data)
	if err != nil {
		return nil, err
	}
	err = r.DB.QueryRow(query, args...).Scan(&v.ID)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *VLANRepository) Update(v models.VLAN) (int64, error) {
	query := "UPDATE vlans SET vlan_id=$1, name=$2, description=$3 WHERE id=$4"
	res, err := r.DB.Exec(query, v.VlanID, v.Name, v.Description, v.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *VLANRepository) Delete(id string) (int64, error) {
	query := "DELETE FROM vlans WHERE id = $1"
	res, err := r.DB.Exec(query, id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *VLANRepository) Patch(id string, updates map[string]interface{}, allowedFields map[string]bool) (int64, error) {
	query, args, err := utils.BuildUpdateQuery("vlans", updates, allowedFields, id)
	if err != nil {
		return 0, err
	}
	res, err := r.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *VLANRepository) BulkPatch(updates []map[string]interface{}, allowedFields map[string]bool) error {
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
		query, args, err := utils.BuildUpdateQuery("vlans", item, allowedFields, id)
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

func (r *VLANRepository) BulkDelete(ids []string) error {
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
	query := "DELETE FROM vlans WHERE id = $1"
	for _, id := range ids {
		res, err := tx.Exec(query, id)
		if err != nil {
			return err
		}
		rows, _ := res.RowsAffected()
		if rows == 0 {
			return fmt.Errorf("VLAN ID %v not found", id)
		}
	}
	return tx.Commit()
}

// Helpers

func (r *VLANRepository) filterVLANs(filters map[string]string) (string, []interface{}) {
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

func (r *VLANRepository) addVLANSorting(query string, sorts []string) string {
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
		if allowedParams[field] && (order == "asc" || order == "desc") {
			orderClauses = append(orderClauses, fmt.Sprintf("%s %s", field, order))
		}
	}
	if len(orderClauses) > 0 {
		query += " ORDER BY " + strings.Join(orderClauses, ", ")
	}
	return query
}
