package router

import (
	"restapi/internal/api/handlers"

	"github.com/gorilla/mux"
)

func RegisterUserRoutes(router *mux.Router) {
	users := router.PathPrefix("/users").Subrouter()
	users.HandleFunc("", handlers.GetUsers).Methods("GET")
	users.HandleFunc("", handlers.CreateUser).Methods("POST")
	users.HandleFunc("/{id}", handlers.GetUser).Methods("GET")
	users.HandleFunc("/{id}", handlers.UpdateUser).Methods("PUT")
	users.HandleFunc("/{id}", handlers.DeleteUser).Methods("DELETE")

	users.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	users.HandleFunc("/logout", handlers.LogoutHandler).Methods("POST")

}
