package router

import (
	"restapi/internal/api/handlers"

	"github.com/gorilla/mux"
)

func RegisterLocationRoutes(router *mux.Router) {
	locations := router.PathPrefix("/locations").Subrouter()
	locations.HandleFunc("", handlers.GetLocations).Methods("GET")
	locations.HandleFunc("", handlers.CreateLocation).Methods("POST")
	locations.HandleFunc("", handlers.BulkPatchLocations).Methods("PATCH")
	locations.HandleFunc("", handlers.BulkDeleteLocations).Methods("DELETE")
	locations.HandleFunc("/{id}", handlers.GetLocation).Methods("GET")
	locations.HandleFunc("/{id}", handlers.UpdateLocation).Methods("PUT")
	locations.HandleFunc("/{id}", handlers.PatchLocation).Methods("PATCH")
	locations.HandleFunc("/{id}", handlers.DeleteLocation).Methods("DELETE")
	locations.HandleFunc("/{id}/devices", handlers.GetDevicesByLocation).Methods("GET")
	locations.HandleFunc("/{id}/devicescount", handlers.GetDeviceCount).Methods("GET")
}
