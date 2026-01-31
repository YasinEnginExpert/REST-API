package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"restapi/internal/models"
	"strconv"
	"sync"

	"github.com/gorilla/mux"
)

// In-Memory Storage
var (
	deviceStore []models.Device
	mutex       sync.Mutex
)

// Initialize mock data on startup
func init() {
	deviceStore = []models.Device{
		{ID: "1", Hostname: "srl-spine-01", IP: "192.168.1.10", Model: "7250 IXR", OS: "SR Linux"},
		{ID: "2", Hostname: "srl-leaf-01", IP: "192.168.1.11", Model: "7220 IXR", OS: "SR Linux"},
		{ID: "3", Hostname: "srl-leaf-02", IP: "192.168.1.12", Model: "7220 IXR", OS: "SR Linux"},
		{ID: "4", Hostname: "cisco-core-01", IP: "10.0.0.1", Model: "Catalyst 9500", OS: "IOS-XE"},
		{ID: "5", Hostname: "cisco-access-01", IP: "10.0.10.5", Model: "Catalyst 9300", OS: "IOS-XE"},
		{ID: "6", Hostname: "juniper-edge-01", IP: "172.16.50.1", Model: "MX204", OS: "Junos OS"},
		{ID: "7", Hostname: "arista-spine-01", IP: "192.168.20.1", Model: "DCS-7050", OS: "EOS"},
		{ID: "8", Hostname: "nokia-ixr-01", IP: "10.20.30.40", Model: "7250 IXR", OS: "SR Linux"},
	}
}

// GetDevices handles GET requests for listing devices with optional filtering
func GetDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	hostname := r.URL.Query().Get("hostname")
	ip := r.URL.Query().Get("ip")

	fmt.Println("Handling GET Request - Retrieving Device List")

	mutex.Lock()
	currentDevices := make([]models.Device, len(deviceStore))
	copy(currentDevices, deviceStore)
	mutex.Unlock()

	// Filtering Logic
	filteredDevices := make([]models.Device, 0)
	for _, device := range currentDevices {
		if (hostname == "" || device.Hostname == hostname) && (ip == "" || device.IP == ip) {
			filteredDevices = append(filteredDevices, device)
		}
	}

	response := struct {
		Status string          `json:"status"`
		Count  int             `json:"count"`
		Data   []models.Device `json:"data"`
	}{
		Status: "success",
		Count:  len(filteredDevices),
		Data:   filteredDevices,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// GetDevice handles GET requests for a single device by ID
func GetDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	fmt.Println("Handling GET Request - Single Device ID:", id)

	mutex.Lock()
	currentDevices := deviceStore
	mutex.Unlock()

	var foundDevice *models.Device
	for _, d := range currentDevices {
		if d.ID == id {
			foundDevice = &d
			break
		}
	}

	if foundDevice == nil {
		http.Error(w, "Device not found", http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(foundDevice); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// CreateDevice handles POST requests to add a new device
func CreateDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Handling POST Request - Adding Device")

	var newDevice models.Device
	if err := json.NewDecoder(r.Body).Decode(&newDevice); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	// Simple ID generation
	maxID := 0
	for _, d := range deviceStore {
		idInt, _ := strconv.Atoi(d.ID)
		if idInt > maxID {
			maxID = idInt
		}
	}
	newDevice.ID = strconv.Itoa(maxID + 1)

	deviceStore = append(deviceStore, newDevice)

	response := struct {
		Status string          `json:"status"`
		Count  int             `json:"count"`
		Data   []models.Device `json:"data"`
	}{
		Status: "success",
		Count:  1,
		Data:   []models.Device{newDevice},
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateDevice handles PUT requests
func UpdateDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Handling PUT Request - Updating Device")
	w.Write([]byte(`{"message": "Hello PUT Method on Devices Route"}`))
}

// PatchDevice handles PATCH requests
func PatchDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Handling PATCH Request - Patching Device")
	w.Write([]byte(`{"message": "Hello PATCH Method on Devices Route"}`))
}

// DeleteDevice handles DELETE requests
func DeleteDevice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Handling DELETE Request - Deleting Device")
	w.Write([]byte(`{"message": "Hello DELETE Method on Devices Route"}`))
}
