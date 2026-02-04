package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterUserRoutes(router *mux.Router) {
	users := router.PathPrefix("/users").Subrouter()
	users.HandleFunc("", handlers.CreateUser).Methods("POST")
	users.HandleFunc("/login", handlers.LoginHandler).Methods("POST")

	// Protected Routes
	users.Handle("", middlewares.AuthMiddleware(http.HandlerFunc(handlers.GetUsers))).Methods("GET")
	users.Handle("/{id}", middlewares.AuthMiddleware(http.HandlerFunc(handlers.GetUser))).Methods("GET")
	users.Handle("/{id}", middlewares.AuthMiddleware(http.HandlerFunc(handlers.UpdateUser))).Methods("PUT")
	users.Handle("/{id}", middlewares.AuthMiddleware(http.HandlerFunc(handlers.DeleteUser))).Methods("DELETE")
	users.Handle("/logout", middlewares.AuthMiddleware(http.HandlerFunc(handlers.LogoutHandler))).Methods("POST")
}
