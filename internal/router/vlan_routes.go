package router

import (
	"restapi/internal/api/handlers"

	"github.com/gorilla/mux"
)

func RegisterVLANRoutes(router *mux.Router) {
	vlans := router.PathPrefix("/vlans").Subrouter()
	vlans.HandleFunc("", handlers.GetVLANs).Methods("GET")
	vlans.HandleFunc("", handlers.CreateVLAN).Methods("POST")
	vlans.HandleFunc("", handlers.BulkPatchVLANs).Methods("PATCH")
	vlans.HandleFunc("", handlers.BulkDeleteVLANs).Methods("DELETE")
	vlans.HandleFunc("/{id}", handlers.GetVLAN).Methods("GET")
	vlans.HandleFunc("/{id}", handlers.UpdateVLAN).Methods("PUT")
	vlans.HandleFunc("/{id}", handlers.PatchVLAN).Methods("PATCH")
	vlans.HandleFunc("/{id}", handlers.DeleteVLAN).Methods("DELETE")
}
