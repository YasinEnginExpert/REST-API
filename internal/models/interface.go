package models

type Interface struct {
	ID        string `json:"id"`
	DeviceID  string `json:"device_id"`
	Name      string `json:"name"`                 // e.g., GigabitEthernet0/1
	IPAddress string `json:"ip_address,omitempty"` // Interface might be L2 (no IP)
	Status    string `json:"status"`               // e.g., "up", "down"
}
