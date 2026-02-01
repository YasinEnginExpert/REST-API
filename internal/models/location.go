package models

type Location struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	City      string `json:"city"`
	Country   string `json:"country"`
	Address   string `json:"address,omitempty"`
	CreatedAt string `json:"created_at"`
}
