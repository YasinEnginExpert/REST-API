package models

import (
	"errors"
	"strings"
)

type VLAN struct {
	ID          string `json:"id" db:"id"`
	VlanID      int    `json:"vlan_id" db:"vlan_id"` // 1-4096
	Name        string `json:"name" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
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
