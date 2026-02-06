package router

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterEventRoutes(router *mux.Router) {
	eventRouter := router.PathPrefix("/events").Subrouter()

	// Auth required for events
	eventRouter.Use(middlewares.AuthMiddleware)

	eventRouter.HandleFunc("", handlers.GetEvents).Methods("GET")

	// Create event (internal or system only usually, but exposing for now)
	eventRouter.HandleFunc("", handlers.CreateEvent).Methods("POST")
}
