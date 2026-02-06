package models

// Event represents an alert/event (device_down, link_flap, high_cpu, etc.)
type Event struct {
	ID              string `json:"id" db:"id"`
	Severity        string `json:"severity" db:"severity"` // critical, high, medium, low, info
	Type            string `json:"type" db:"type"`
	Message         string `json:"message" db:"message"`
	DeviceID        string `json:"device_id,omitempty" db:"device_id"`
	InterfaceID     string `json:"interface_id,omitempty" db:"interface_id"`
	LocationID      string `json:"location_id,omitempty" db:"location_id"`
	CreatedAt       string `json:"created_at" db:"created_at"`
	AcknowledgedAt  string `json:"acknowledged_at,omitempty" db:"acknowledged_at"`
	AcknowledgedBy  string `json:"acknowledged_by,omitempty" db:"acknowledged_by"`
}
