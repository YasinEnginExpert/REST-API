package models

// AuditLog records user actions for compliance (create_device, update_vlan, etc.)
type AuditLog struct {
	ID           string `json:"id" db:"id"`
	UserID       string `json:"user_id,omitempty" db:"user_id"`
	Action       string `json:"action" db:"action"`
	ResourceType string `json:"resource_type,omitempty" db:"resource_type"`
	ResourceID   string `json:"resource_id,omitempty" db:"resource_id"`
	IPAddress    string `json:"ip_address,omitempty" db:"ip_address"`
	CreatedAt    string `json:"created_at" db:"created_at"`
}
