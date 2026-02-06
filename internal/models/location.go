package models

import (
	"errors"
	"strings"
)

type Location struct {
	ID        string   `json:"id" db:"id"`
	Name      string   `json:"name" db:"name"`
	City      string   `json:"city" db:"city"`
	Country   string   `json:"country" db:"country"`
	Address   string   `json:"address,omitempty" db:"address"`
	SiteCode  string   `json:"site_code,omitempty" db:"site_code"`
	Timezone  string   `json:"timezone,omitempty" db:"timezone"`
	Lat       *float64 `json:"lat,omitempty" db:"lat"`
	Lon       *float64 `json:"lon,omitempty" db:"lon"`
	CreatedAt string   `json:"created_at" db:"created_at"`
	UpdatedAt string   `json:"updated_at,omitempty" db:"updated_at"`
}

// Validate checks for required fields
func (l *Location) Validate() error {
	if strings.TrimSpace(l.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(l.City) == "" {
		return errors.New("city is required")
	}
	if strings.TrimSpace(l.Country) == "" {
		return errors.New("country is required")
	}
	if strings.TrimSpace(l.Address) == "" {
		return errors.New("address is required")
	}
	return nil
}
