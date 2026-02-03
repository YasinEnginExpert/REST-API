package models

import (
	"errors"
	"net"
	"strings"
)

type Device struct {
	ID           string `json:"id" db:"id"`
	Hostname     string `json:"hostname" db:"hostname"`
	IP           string `json:"ip" db:"ip"`
	Model        string `json:"model" db:"model"`   // e.g., Cisco 2960, Juniper SRX
	Vendor       string `json:"vendor" db:"vendor"` // e.g. Cisco, Nokia
	OS           string `json:"os" db:"os"`         // e.g., Cisco IOS, Junos
	SerialNumber string `json:"serial_number,omitempty" db:"serial_number"`
	Status       string `json:"status" db:"status"` // active, offline
	RackPosition string `json:"rack_position,omitempty" db:"rack_position"`
	LocationID   string `json:"location_id,omitempty" db:"location_id"`
	CreatedAt    string `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt    string `json:"updated_at,omitempty" db:"updated_at"`
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
		"active":       true,
		"offline":      true,
		"maintenance":  true,
		"provisioning": true,
	}
	if !validStatuses[strings.ToLower(d.Status)] {
		return errors.New("invalid status value")
	}

	return nil
}
