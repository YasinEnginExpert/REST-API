package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"restapi/internal/config"
	"restapi/internal/repositories/sqlconnect"

	_ "github.com/lib/pq"
)

func loginAndGetDB() *sql.DB {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	db, err := sql.Open("postgres", cfg.Database.GetDSN()) // Use the struct method
	if err != nil {
		panic(err)
	}
	if err := db.Ping(); err != nil {
		panic(err)
	}
	fmt.Println("Connected to Database")
	return db
}

func exportToJSON(filename string, data interface{}) {
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(data); err != nil {
		panic(err)
	}
	fmt.Printf("Exported: %s\n", filename)
}

func main() {
	db := loginAndGetDB()
	defer db.Close()

	// 1. Export Locations
	fmt.Println("Exporting Locations...")
	locRepo := sqlconnect.NewLocationRepository(db)
	locations, err := locRepo.GetAll(map[string]string{}, []string{}, 1000000, 0)
	if err != nil {
		log.Fatalf("Error fetching locations: %v", err)
	}
	exportToJSON("locations.json", locations)

	// 2. Export Devices
	fmt.Println("Exporting Devices...")
	devRepo := sqlconnect.NewDeviceRepository(db)
	devices, err := devRepo.GetAll(map[string]string{}, []string{}, 1000000, 0)
	if err != nil {
		log.Fatalf("Error fetching devices: %v", err)
	}
	exportToJSON("devices.json", devices)

	// 3. Export Users
	fmt.Println("Exporting Users...")
	userRepo := sqlconnect.NewUserRepository(db)
	users, err := userRepo.GetAll(1000000, 0)
	if err != nil {
		log.Fatalf("Error fetching users: %v", err)
	}
	exportToJSON("users.json", users)

	// 4. Export VLANs
	fmt.Println("Exporting VLANs...")
	vlanRepo := sqlconnect.NewVLANRepository(db)
	vlans, err := vlanRepo.GetAll(map[string]string{}, []string{}, 1000000, 0)
	if err != nil {
		log.Fatalf("Error fetching VLANs: %v", err)
	}
	exportToJSON("vlans.json", vlans)

	// 5. Export Interfaces
	fmt.Println("Exporting Interfaces...")
	interfaceRepo := sqlconnect.NewInterfaceRepository(db)
	interfaces, err := interfaceRepo.GetAll(map[string]string{}, []string{}, 1000000, 0)
	if err != nil {
		log.Fatalf("Error fetching interfaces: %v", err)
	}
	exportToJSON("interfaces.json", interfaces)

	fmt.Println("All exports completed successfully.")
}
