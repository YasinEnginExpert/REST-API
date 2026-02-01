package models

type VLAN struct {
	ID          string `json:"id"`
	VlanID      int    `json:"vlan_id"` // 1-4096
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}
