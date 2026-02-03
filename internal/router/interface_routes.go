package router

import (
	"restapi/internal/api/handlers"

	"github.com/gorilla/mux"
)

func RegisterInterfaceRoutes(router *mux.Router) {
	interfaces := router.PathPrefix("/interfaces").Subrouter()
	interfaces.HandleFunc("", handlers.GetInterfaces).Methods("GET")
	interfaces.HandleFunc("", handlers.CreateInterface).Methods("POST")
	interfaces.HandleFunc("", handlers.BulkPatchInterfaces).Methods("PATCH")
	interfaces.HandleFunc("", handlers.BulkDeleteInterfaces).Methods("DELETE")
	interfaces.HandleFunc("/{id}", handlers.GetInterface).Methods("GET")
	interfaces.HandleFunc("/{id}", handlers.UpdateInterface).Methods("PUT")
	interfaces.HandleFunc("/{id}", handlers.PatchInterface).Methods("PATCH")
	interfaces.HandleFunc("/{id}", handlers.DeleteInterface).Methods("DELETE")
}
