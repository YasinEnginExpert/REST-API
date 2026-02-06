package router

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterLinkRoutes(router *mux.Router) {
	linkRouter := router.PathPrefix("/links").Subrouter()

	// Auth and Role protection
	linkRouter.Use(middlewares.AuthMiddleware)

	linkRouter.HandleFunc("", handlers.GetLinks).Methods("GET")
	linkRouter.HandleFunc("/{id}", handlers.GetLink).Methods("GET")

	// Mutators require admin/editor role
	mutateRouter := linkRouter.PathPrefix("").Subrouter()
	mutateRouter.Use(middlewares.RequireRole("admin", "editor"))

	mutateRouter.HandleFunc("", handlers.CreateLink).Methods("POST")
	mutateRouter.HandleFunc("/{id}", handlers.UpdateLink).Methods("PUT")
	mutateRouter.HandleFunc("/{id}", handlers.DeleteLink).Methods("DELETE")
}
