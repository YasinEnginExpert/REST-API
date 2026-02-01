package models

type Device struct {
	ID           string `json:"id"`
	Hostname     string `json:"hostname"`
	IP           string `json:"ip"`
	Model        string `json:"model"`  // e.g., Cisco 2960, Juniper SRX
	Vendor       string `json:"vendor"` // e.g. Cisco, Nokia
	OS           string `json:"os"`     // e.g., Cisco IOS, Junos
	SerialNumber string `json:"serial_number,omitempty"`
	Status       string `json:"status"` // active, offline
	RackPosition string `json:"rack_position,omitempty"`
	LocationID   string `json:"location_id,omitempty"`
	CreatedAt    string `json:"created_at,omitempty"`
	UpdatedAt    string `json:"updated_at,omitempty"`
}
