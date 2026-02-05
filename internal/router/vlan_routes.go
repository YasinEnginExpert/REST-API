package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterVLANRoutes(router *mux.Router) {
	vlans := router.PathPrefix("/vlans").Subrouter()

	// Authentication required for all VLAN actions
	vlans.Use(middlewares.AuthMiddleware)

	// Admin only for mutations
	adminOnly := middlewares.RequireRole("admin")

	vlans.HandleFunc("", handlers.GetVLANs).Methods("GET")
	vlans.Handle("", adminOnly(http.HandlerFunc(handlers.CreateVLAN))).Methods("POST")
	vlans.Handle("", adminOnly(http.HandlerFunc(handlers.BulkPatchVLANs))).Methods("PATCH")
	vlans.Handle("", adminOnly(http.HandlerFunc(handlers.BulkDeleteVLANs))).Methods("DELETE")

	vlans.HandleFunc("/{id}", handlers.GetVLAN).Methods("GET")
	vlans.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.UpdateVLAN))).Methods("PUT")
	vlans.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.PatchVLAN))).Methods("PATCH")
	vlans.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.DeleteVLAN))).Methods("DELETE")
}
