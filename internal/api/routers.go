package api

import (
	"net/http"
	"restapi/internal/api/handlers"
)

func Routes() {
	// Devices
	http.HandleFunc("/devices", handlers.GetDevices)
	http.HandleFunc("/devices/create", handlers.CreateDevice) // Simplified for standard http.ServeMux

	// Interfaces
	http.HandleFunc("/interfaces", handlers.GetInterfaces)
}
