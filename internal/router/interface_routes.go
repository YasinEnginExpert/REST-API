package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterInterfaceRoutes(router *mux.Router) {
	interfaces := router.PathPrefix("/interfaces").Subrouter()

	// Authentication required for all interface actions
	interfaces.Use(middlewares.AuthMiddleware)

	// Admin only for mutations
	adminOnly := middlewares.RequireRole("admin")

	interfaces.HandleFunc("", handlers.GetInterfaces).Methods("GET")
	interfaces.Handle("", adminOnly(http.HandlerFunc(handlers.CreateInterface))).Methods("POST")
	interfaces.Handle("", adminOnly(http.HandlerFunc(handlers.BulkPatchInterfaces))).Methods("PATCH")
	interfaces.Handle("", adminOnly(http.HandlerFunc(handlers.BulkDeleteInterfaces))).Methods("DELETE")

	interfaces.HandleFunc("/{id}", handlers.GetInterface).Methods("GET")
	interfaces.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.UpdateInterface))).Methods("PUT")
	interfaces.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.PatchInterface))).Methods("PATCH")
	interfaces.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.DeleteInterface))).Methods("DELETE")
}
