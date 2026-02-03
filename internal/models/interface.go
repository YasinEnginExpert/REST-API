package models

import (
	"errors"
	"net"
	"regexp"
	"strings"
)

type Interface struct {
	ID          string `json:"id" db:"id"`
	DeviceID    string `json:"device_id" db:"device_id"`
	Name        string `json:"name" db:"name"`                       // e.g., GigabitEthernet0/1
	IPAddress   string `json:"ip_address,omitempty" db:"ip_address"` // Interface might be L2 (no IP)
	MACAddress  string `json:"mac_address,omitempty" db:"mac_address"`
	Speed       string `json:"speed,omitempty" db:"speed"`
	Type        string `json:"type,omitempty" db:"type"`
	Description string `json:"description,omitempty" db:"description"`
	Status      string `json:"status" db:"status"` // e.g., "up", "down"
	CreatedAt   string `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt   string `json:"updated_at,omitempty" db:"updated_at"`
}

// Validate checks for required fields and logical constraints
func (i *Interface) Validate() error {
	if strings.TrimSpace(i.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(i.DeviceID) == "" {
		return errors.New("device_id is required")
	}
	if strings.TrimSpace(i.Type) == "" {
		return errors.New("type is required")
	}
	// Check MAC Address format if provided
	if i.MACAddress != "" {
		// Simple regex for MAC address (accepts : or - as separator)
		macRegex := regexp.MustCompile(`^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`)
		if !macRegex.MatchString(i.MACAddress) {
			return errors.New("invalid mac_address format")
		}
	}
	// Check IP Address if provided
	if i.IPAddress != "" {
		if ip := net.ParseIP(i.IPAddress); ip == nil {
			return errors.New("invalid ip_address format")
		}
	}

	validStatuses := map[string]bool{
		"up":                    true,
		"down":                  true,
		"administratively down": true,
	}
	if i.Status != "" && !validStatuses[strings.ToLower(i.Status)] {
		return errors.New("invalid status value")
	}

	return nil
}
