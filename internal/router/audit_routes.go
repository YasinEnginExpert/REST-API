package router

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterAuditRoutes(router *mux.Router) {
	auditRouter := router.PathPrefix("/audit-logs").Subrouter()
	auditRouter.Use(middlewares.AuthMiddleware)

	// Admin only for logs
	auditRouter.Use(middlewares.RequireRole("admin"))

	auditRouter.HandleFunc("", handlers.GetAuditLogs).Methods("GET")
}
