package models

type Location struct {
	ID        string `json:"id" db:"id"`
	Name      string `json:"name" db:"name"`
	City      string `json:"city" db:"city"`
	Country   string `json:"country" db:"country"`
	Address   string `json:"address,omitempty" db:"address"`
	CreatedAt string `json:"created_at" db:"created_at"`
}
