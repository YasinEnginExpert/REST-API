package sqlconnect

import (
	"database/sql"
	"fmt"
	"restapi/internal/models"
	"strings"
)

type LinkRepository struct {
	DB *sql.DB
}

func NewLinkRepository(db *sql.DB) *LinkRepository {
	return &LinkRepository{DB: db}
}

func (r *LinkRepository) GetAll(filters map[string]string, limit int, offset int) ([]models.Link, error) {
	query, args := r.filterLinks(filters)

	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var l models.Link
		var status sql.NullString
		var lastSeen, createdAt sql.NullTime
		if err := rows.Scan(&l.ID, &l.AInterfaceID, &l.BInterfaceID, &l.Discovery, &lastSeen, &status, &createdAt); err != nil {
			return nil, err
		}
		l.LastSeen = formatNullTime(lastSeen)
		l.Status = status.String
		l.CreatedAt = formatNullTime(createdAt)
		links = append(links, l)
	}
	return links, nil
}

func (r *LinkRepository) Count(filters map[string]string) (int, error) {
	query, args := r.filterLinks(filters)
	countQuery := strings.Replace(query, "SELECT id, a_interface_id, b_interface_id, discovery, last_seen, status, created_at FROM links", "SELECT COUNT(*) FROM links", 1)

	var count int
	err := r.DB.QueryRow(countQuery, args...).Scan(&count)
	return count, err
}

func (r *LinkRepository) Create(l models.Link) (*models.Link, error) {
	query := `INSERT INTO links (a_interface_id, b_interface_id, discovery, last_seen, status) 
			  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING id, created_at`

	// Ensure lexicographical order for unique constraint (a < b)
	if l.AInterfaceID > l.BInterfaceID {
		l.AInterfaceID, l.BInterfaceID = l.BInterfaceID, l.AInterfaceID
	}

	var createdAt sql.NullTime
	err := r.DB.QueryRow(query, l.AInterfaceID, l.BInterfaceID, l.Discovery, l.Status).Scan(&l.ID, &createdAt)
	if err != nil {
		return nil, err
	}
	l.CreatedAt = formatNullTime(createdAt)
	return &l, nil
}

func (r *LinkRepository) GetByID(id string) (*models.Link, error) {
	var l models.Link
	var status sql.NullString
	var lastSeen, createdAt sql.NullTime

	query := "SELECT id, a_interface_id, b_interface_id, discovery, last_seen, status, created_at FROM links WHERE id=$1"
	err := r.DB.QueryRow(query, id).Scan(&l.ID, &l.AInterfaceID, &l.BInterfaceID, &l.Discovery, &lastSeen, &status, &createdAt)
	if err != nil {
		return nil, err
	}

	l.LastSeen = formatNullTime(lastSeen)
	l.Status = status.String
	l.CreatedAt = formatNullTime(createdAt)
	return &l, nil
}

func (r *LinkRepository) Delete(id string) (int64, error) {
	res, err := r.DB.Exec("DELETE FROM links WHERE id=$1", id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

// Update mainly updates status or discovery method
func (r *LinkRepository) Update(l models.Link) (int64, error) {
	query := `UPDATE links SET discovery=$1, status=$2, last_seen=CURRENT_TIMESTAMP WHERE id=$3`
	res, err := r.DB.Exec(query, l.Discovery, l.Status, l.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

// Helpers

func (r *LinkRepository) filterLinks(filters map[string]string) (string, []interface{}) {
	query := "SELECT id, a_interface_id, b_interface_id, discovery, last_seen, status, created_at FROM links WHERE 1=1"
	var args []interface{}
	argId := 1

	allowedParams := map[string]string{
		"a_interface_id": "a_interface_id",
		"b_interface_id": "b_interface_id",
		"discovery":      "discovery",
		"status":         "status",
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
