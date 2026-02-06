package models

import (
	"errors"
	"strings"
)

type VLAN struct {
	ID          string `json:"id" db:"id"`
	VlanID      int    `json:"vlan_id" db:"vlan_id"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
	LocationID  string `json:"location_id,omitempty" db:"location_id"`
	SubnetCIDR  string `json:"subnet_cidr,omitempty" db:"subnet_cidr"`
	GatewayIP   string `json:"gateway_ip,omitempty" db:"gateway_ip"`
	CreatedAt   string `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt   string `json:"updated_at,omitempty" db:"updated_at"`
}

// Validate checks for required fields and value ranges
func (v *VLAN) Validate() error {
	if v.VlanID < 1 || v.VlanID > 4094 {
		return errors.New("vlan_id must be between 1 and 4094")
	}
	if strings.TrimSpace(v.Name) == "" {
		return errors.New("name is required")
	}
	return nil
}
