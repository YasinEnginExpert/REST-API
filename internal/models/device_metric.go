package models

// DeviceMetric is a timeseries snapshot (cpu, memory, temp, uptime)
type DeviceMetric struct {
	ID            string  `json:"id" db:"id"`
	DeviceID      string  `json:"device_id" db:"device_id"`
	CPU           *float64 `json:"cpu,omitempty" db:"cpu"`
	Memory        *float64 `json:"memory,omitempty" db:"memory"`
	Temp          *float64 `json:"temp,omitempty" db:"temp"`
	UptimeSeconds *int64   `json:"uptime_seconds,omitempty" db:"uptime_seconds"`
	Ts            string  `json:"ts" db:"ts"`
}
