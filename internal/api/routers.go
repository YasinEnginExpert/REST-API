package api

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func Routes() *mux.Router {
	router := mux.NewRouter()

	// Global Middleware
	router.Use(middlewares.Recovery) // Should be first to catch panics
	router.Use(middlewares.Logger)   // Log requests
	router.Use(middlewares.Cors)
	router.Use(middlewares.SecurityHeaders)

	// Root
	router.HandleFunc("/", handlers.RootHandler).Methods("GET")

	// Devices
	router.HandleFunc("/devices", handlers.Devices).Methods("GET", "POST")

	// Interfaces
	router.HandleFunc("/interfaces", handlers.Interfaces).Methods("GET", "POST", "PUT", "PATCH", "DELETE")

	return router
}
