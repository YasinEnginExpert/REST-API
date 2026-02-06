package sqlconnect

import (
	"database/sql"
	"restapi/internal/models"
)

type AuditRepository struct {
	DB *sql.DB
}

func NewAuditRepository(db *sql.DB) *AuditRepository {
	return &AuditRepository{DB: db}
}

func (r *AuditRepository) LogAction(log models.AuditLog) error {
	query := `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address) 
			  VALUES ($1, $2, $3, $4, $5)`

	_, err := r.DB.Exec(query,
		sql.NullString{String: log.UserID, Valid: log.UserID != ""},
		log.Action,
		sql.NullString{String: log.ResourceType, Valid: log.ResourceType != ""},
		sql.NullString{String: log.ResourceID, Valid: log.ResourceID != ""},
		sql.NullString{String: log.IPAddress, Valid: log.IPAddress != ""},
	)
	return err
}

func (r *AuditRepository) GetAll(limit, offset int) ([]models.AuditLog, error) {
	query := "SELECT id, user_id, action, resource_type, resource_id, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2"
	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []models.AuditLog
	for rows.Next() {
		var l models.AuditLog
		var uID, rType, rID, ip sql.NullString
		var createdAt sql.NullTime
		if err := rows.Scan(&l.ID, &uID, &l.Action, &rType, &rID, &ip, &createdAt); err != nil {
			return nil, err
		}
		l.UserID = uID.String
		l.ResourceType = rType.String
		l.ResourceID = rID.String
		l.IPAddress = ip.String
		l.CreatedAt = formatNullTime(createdAt)
		logs = append(logs, l)
	}
	return logs, nil
}

func (r *AuditRepository) Count() (int, error) {
	var count int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM audit_logs").Scan(&count)
	return count, err
}
