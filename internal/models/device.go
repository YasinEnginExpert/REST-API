package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"net"
	"strings"
)

// StringSlice is a custom type for handling JSONB arrays in PostgreSQL
type StringSlice []string

func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, s)
}

func (s StringSlice) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	return json.Marshal(s)
}

type Device struct {
	ID           string      `json:"id" db:"id"`
	Hostname     string      `json:"hostname" db:"hostname"`
	IP           string      `json:"ip" db:"ip"`
	Model        string      `json:"model" db:"model"`
	Vendor       string      `json:"vendor" db:"vendor"`
	OS           string      `json:"os" db:"os"`
	OSVersion    string      `json:"os_version,omitempty" db:"os_version"`
	SerialNumber string      `json:"serial_number,omitempty" db:"serial_number"`
	Status       string      `json:"status" db:"status"` // active, offline, maintenance, decommissioned
	Role         string      `json:"role,omitempty" db:"role"`
	RackPosition string      `json:"rack_position,omitempty" db:"rack_position"`
	LocationID   string      `json:"location_id,omitempty" db:"location_id"`
	LastSeen     string      `json:"last_seen,omitempty" db:"last_seen"`
	Tags         StringSlice `json:"tags,omitempty" db:"tags"` // JSONB in DB
	Notes        string      `json:"notes,omitempty" db:"notes"`
	CreatedAt    string      `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt    string      `json:"updated_at,omitempty" db:"updated_at"`
}

// Validate checks for required fields and logical constraints
func (d *Device) Validate() error {
	if strings.TrimSpace(d.Hostname) == "" {
		return errors.New("hostname is required")
	}
	if strings.TrimSpace(d.IP) == "" {
		return errors.New("ip address is required")
	}
	if ip := net.ParseIP(d.IP); ip == nil {
		return errors.New("invalid ip address format")
	}
	if strings.TrimSpace(d.Model) == "" {
		return errors.New("model is required")
	}
	if strings.TrimSpace(d.Vendor) == "" {
		return errors.New("vendor is required")
	}
	if strings.TrimSpace(d.OS) == "" {
		return errors.New("os is required")
	}
	if strings.TrimSpace(d.Status) == "" {
		return errors.New("status is required")
	}

	validStatuses := map[string]bool{
		"active":         true,
		"offline":        true,
		"maintenance":    true,
		"provisioning":   true,
		"decommissioned": true,
	}
	if !validStatuses[strings.ToLower(d.Status)] {
		return errors.New("invalid status value")
	}

	return nil
}
