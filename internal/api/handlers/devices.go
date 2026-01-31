package handlers

import (
	"fmt"
	"net/http"
)

// Devices handles all HTTP methods for the devices endpoint
func Devices(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Processing request for Devices Route. Method:", r.Method)

	switch r.Method {
	case http.MethodGet:
		fmt.Println("Handling GET Request - Updating Device")
		w.Write([]byte(`{"message": "Hello PUT Method on Devices Route"}`))
	case http.MethodPost:
		fmt.Println("Handling POST Request - Creating Device")
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"message": "Hello POST Method on Devices Route"}`))
	case http.MethodPut:
		fmt.Println("Handling PUT Request - Updating Device")
		w.Write([]byte(`{"message": "Hello PUT Method on Devices Route"}`))

	case http.MethodPatch:
		fmt.Println("Handling PATCH Request - Patching Device")
		w.Write([]byte(`{"message": "Hello PATCH Method on Devices Route"}`))

	case http.MethodDelete:
		fmt.Println("Handling DELETE Request - Deleting Device")
		w.Write([]byte(`{"message": "Hello DELETE Method on Devices Route"}`))

	default:
		fmt.Println("Method not allowed")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
