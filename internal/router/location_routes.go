package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterLocationRoutes(router *mux.Router) {
	locations := router.PathPrefix("/locations").Subrouter()

	// Authentication required for all location actions
	locations.Use(middlewares.AuthMiddleware)

	// Admin only for mutations
	adminOnly := middlewares.RequireRole("admin")

	locations.HandleFunc("", handlers.GetLocations).Methods("GET")
	locations.Handle("", adminOnly(http.HandlerFunc(handlers.CreateLocation))).Methods("POST")
	locations.Handle("", adminOnly(http.HandlerFunc(handlers.BulkPatchLocations))).Methods("PATCH")
	locations.Handle("", adminOnly(http.HandlerFunc(handlers.BulkDeleteLocations))).Methods("DELETE")

	locations.HandleFunc("/{id}", handlers.GetLocation).Methods("GET")
	locations.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.UpdateLocation))).Methods("PUT")
	locations.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.PatchLocation))).Methods("PATCH")
	locations.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.DeleteLocation))).Methods("DELETE")

	locations.HandleFunc("/{id}/devices", handlers.GetDevicesByLocation).Methods("GET")
	locations.HandleFunc("/{id}/devicescount", handlers.GetDeviceCount).Methods("GET")
}
