package models

// UserLocationAccess is RBAC: which locations a user can access (read | write | admin)
type UserLocationAccess struct {
	UserID     string `json:"user_id" db:"user_id"`
	LocationID string `json:"location_id" db:"location_id"`
	Permission string `json:"permission" db:"permission"`
	CreatedAt  string `json:"created_at,omitempty" db:"created_at"`
}
