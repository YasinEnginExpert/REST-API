package sqlconnect

import (
	"database/sql"
	"restapi/internal/models"
)

type EventRepository struct {
	DB *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{DB: db}
}

func (r *EventRepository) GetAll(limit, offset int) ([]models.Event, error) {
	query := "SELECT id, severity, type, message, device_id, interface_id, location_id, created_at, acknowledged_at, acknowledged_by FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2"
	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		var devID, intID, locID, ackBy sql.NullString
		var createdAt, ackAt sql.NullTime
		if err := rows.Scan(&e.ID, &e.Severity, &e.Type, &e.Message, &devID, &intID, &locID, &createdAt, &ackAt, &ackBy); err != nil {
			return nil, err
		}
		e.DeviceID = devID.String
		e.InterfaceID = intID.String
		e.LocationID = locID.String
		e.CreatedAt = formatNullTime(createdAt)
		e.AcknowledgedAt = formatNullTime(ackAt)
		e.AcknowledgedBy = ackBy.String
		events = append(events, e)
	}
	return events, nil
}

func (r *EventRepository) Count() (int, error) {
	var count int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM events").Scan(&count)
	return count, err
}

func (r *EventRepository) Create(e models.Event) (*models.Event, error) {
	query := `INSERT INTO events (severity, type, message, device_id, interface_id, location_id) 
			  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`
	var createdAt sql.NullTime

	err := r.DB.QueryRow(query, e.Severity, e.Type, e.Message,
		sql.NullString{String: e.DeviceID, Valid: e.DeviceID != ""},
		sql.NullString{String: e.InterfaceID, Valid: e.InterfaceID != ""},
		sql.NullString{String: e.LocationID, Valid: e.LocationID != ""},
	).Scan(&e.ID, &createdAt)

	if err != nil {
		return nil, err
	}
	e.CreatedAt = formatNullTime(createdAt)
	return &e, nil
}
