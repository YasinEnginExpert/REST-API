package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/models"
)

// GetInterfaces lists interfaces for a specific context (all for now)
func GetInterfaces(w http.ResponseWriter, r *http.Request) {
	// Mock data for demonstration
	interfaces := []models.Interface{
		{
			ID:        "101",
			DeviceID:  "1",
			Name:      "GigabitEthernet0/0/0",
			IPAddress: "192.168.1.1/24",
			Status:    "up",
		},
		{
			ID:        "102",
			DeviceID:  "1",
			Name:      "GigabitEthernet0/0/1",
			IPAddress: "",
			Status:    "down",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(interfaces)
}
