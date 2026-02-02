package models

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
}
