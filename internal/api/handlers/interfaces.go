package handlers

import (
	"fmt"
	"net/http"
)

// Interfaces handles all HTTP methods for the interfaces endpoint
func Interfaces(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Processing request for Interfaces Route. Method:", r.Method)

	switch r.Method {
	case http.MethodGet:
		fmt.Println("Handling GET Request - Updating Device")
		w.Write([]byte(`{"message": "Hello PUT Method on Devices Route"}`))

	case http.MethodPost:
		fmt.Println("Handling POST Request - Creating Interface")
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"message": "Hello POST Method on Interfaces Route"}`))

	case http.MethodPut:
		fmt.Println("Handling PUT Request - Updating Interface")
		w.Write([]byte(`{"message": "Hello PUT Method on Interfaces Route"}`))

	case http.MethodPatch:
		fmt.Println("Handling PATCH Request - Patching Interface")
		w.Write([]byte(`{"message": "Hello PATCH Method on Interfaces Route"}`))

	case http.MethodDelete:
		fmt.Println("Handling DELETE Request - Deleting Interface")
		w.Write([]byte(`{"message": "Hello DELETE Method on Interfaces Route"}`))

	default:
		fmt.Println("Method not allowed")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
