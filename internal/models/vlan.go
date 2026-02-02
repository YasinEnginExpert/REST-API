package models

type VLAN struct {
	ID          string `json:"id" db:"id"`
	VlanID      int    `json:"vlan_id" db:"vlan_id"` // 1-4096
	Name        string `json:"name" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
}
