package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterUserRoutes(router *mux.Router) {
	users := router.PathPrefix("/users").Subrouter()

	// Public Routes
	// Public Routes - Register directly on root router to avoid middleware pollution
	router.HandleFunc("/users", handlers.CreateUser).Methods("POST")
	router.HandleFunc("/users/login", handlers.LoginHandler).Methods("POST")
	router.HandleFunc("/users/forgot-password", handlers.ForgotPassword).Methods("POST")
	router.HandleFunc("/users/reset-password/{resetCode}", handlers.ResetPasswordHandler).Methods("POST")

	// Protected Routes (Require Authentication)
	protected := users.PathPrefix("").Subrouter()
	protected.Use(middlewares.AuthMiddleware)

	// Admin only for user management
	adminOnly := middlewares.RequireRole("admin")
	ownerOrAdmin := middlewares.RequireOwnerOrAdmin()

	protected.Handle("", adminOnly(http.HandlerFunc(handlers.GetUsers))).Methods("GET")
	protected.Handle("/{id}", ownerOrAdmin(http.HandlerFunc(handlers.GetUser))).Methods("GET")
	protected.Handle("/{id}", ownerOrAdmin(http.HandlerFunc(handlers.UpdateUser))).Methods("PUT")
	protected.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.DeleteUser))).Methods("DELETE")
	protected.HandleFunc("/logout", handlers.LogoutHandler).Methods("POST")
	protected.Handle("/{id}/password", ownerOrAdmin(http.HandlerFunc(handlers.UpdatePasswordHandler))).Methods("PUT")
}
