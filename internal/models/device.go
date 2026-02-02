package models

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
