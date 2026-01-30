package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/models"
)

// GetDevices lists all network devices
func GetDevices(w http.ResponseWriter, r *http.Request) {
	// Mock data for demonstration
	devices := []models.Device{
		{
			ID:       "1",
			Hostname: "core-router-01",
			IP:       "192.168.1.1",
			Model:    "Cisco ASR 1000",
			OS:       "IOS-XE 17.3",
		},
		{
			ID:       "2",
			Hostname: "access-switch-01",
			IP:       "192.168.1.10",
			Model:    "Cisco Catalyst 9200",
			OS:       "IOS-XE 17.6",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(devices)
}

// CreateDevice handles adding a new device
func CreateDevice(w http.ResponseWriter, r *http.Request) {
	// Simple stub for creating a device
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Device created successfully"}`))
}
