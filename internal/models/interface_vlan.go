package models

// InterfaceVlan is the pivot for Interface (N) <-> (N) VLAN (tagged/untagged, native)
type InterfaceVlan struct {
	InterfaceID string `json:"interface_id" db:"interface_id"`
	VlanID      string `json:"vlan_id" db:"vlan_id"`
	Tagging     string `json:"tagging" db:"tagging"` // tagged, untagged
	IsNative    bool   `json:"is_native" db:"is_native"`
	CreatedAt   string `json:"created_at,omitempty" db:"created_at"`
}
