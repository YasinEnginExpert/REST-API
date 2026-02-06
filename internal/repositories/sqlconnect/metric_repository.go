package sqlconnect

import (
	"database/sql"
	"restapi/internal/models"
)

type MetricRepository struct {
	DB *sql.DB
}

func NewMetricRepository(db *sql.DB) *MetricRepository {
	return &MetricRepository{DB: db}
}

func (r *MetricRepository) GetLatestByDevice(deviceID string) (*models.DeviceMetric, error) {
	var m models.DeviceMetric
	var cpu, mem, temp sql.NullFloat64
	var uptime sql.NullInt64
	var ts sql.NullTime

	query := "SELECT id, device_id, cpu, memory, temp, uptime_seconds, ts FROM device_metrics WHERE device_id = $1 ORDER BY ts DESC LIMIT 1"
	err := r.DB.QueryRow(query, deviceID).Scan(&m.ID, &m.DeviceID, &cpu, &mem, &temp, &uptime, &ts)
	if err != nil {
		return nil, err
	}

	if cpu.Valid {
		m.CPU = &cpu.Float64
	}
	if mem.Valid {
		m.Memory = &mem.Float64
	}
	if temp.Valid {
		m.Temp = &temp.Float64
	}
	if uptime.Valid {
		m.UptimeSeconds = &uptime.Int64
	}

	m.Ts = formatNullTime(ts)
	return &m, nil
}

func (r *MetricRepository) GetAll(limit, offset int, sortBy string) ([]models.DeviceMetric, error) {
	orderBy := "ts DESC"
	switch sortBy {
	case "cpu:desc":
		orderBy = "cpu DESC"
	case "memory:desc":
		orderBy = "memory DESC"
	case "temp:desc":
		orderBy = "temp DESC"
	case "uptime:desc":
		orderBy = "uptime_seconds DESC"
	}

	query := "SELECT id, device_id, cpu, memory, temp, uptime_seconds, ts FROM device_metrics ORDER BY " + orderBy + " LIMIT $1 OFFSET $2"
	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []models.DeviceMetric
	for rows.Next() {
		var m models.DeviceMetric
		var cpu, mem, temp sql.NullFloat64
		var uptime sql.NullInt64
		var ts sql.NullTime
		if err := rows.Scan(&m.ID, &m.DeviceID, &cpu, &mem, &temp, &uptime, &ts); err != nil {
			return nil, err
		}
		if cpu.Valid {
			m.CPU = &cpu.Float64
		}
		if mem.Valid {
			m.Memory = &mem.Float64
		}
		if temp.Valid {
			m.Temp = &temp.Float64
		}
		if uptime.Valid {
			m.UptimeSeconds = &uptime.Int64
		}
		m.Ts = formatNullTime(ts)
		metrics = append(metrics, m)
	}
	return metrics, nil
}

func (r *MetricRepository) Count() (int, error) {
	var count int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM device_metrics").Scan(&count)
	return count, err
}
