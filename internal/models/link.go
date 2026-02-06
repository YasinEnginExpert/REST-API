package models

// Link represents a connection between two interfaces (LLDP/CDP/manual topology)
type Link struct {
	ID            string `json:"id" db:"id"`
	AInterfaceID  string `json:"a_interface_id" db:"a_interface_id"`
	BInterfaceID  string `json:"b_interface_id" db:"b_interface_id"`
	Discovery     string `json:"discovery" db:"discovery"` // lldp, cdp, manual
	LastSeen      string `json:"last_seen,omitempty" db:"last_seen"`
	Status        string `json:"status,omitempty" db:"status"`
	CreatedAt     string `json:"created_at,omitempty" db:"created_at"`
}
