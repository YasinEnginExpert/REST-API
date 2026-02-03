package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
	fmt.Println("Fetching Locations...")
	locRepo := sqlconnect.NewLocationRepository(db)
	locs, err := locRepo.GetAll(nil, nil)
	if err != nil {
		panic(err)
	}
	exportToJSON("locations.json", locs)

	// 2. Export Devices
	fmt.Println("Fetching Devices...")
	devRepo := sqlconnect.NewDeviceRepository(db)
	devs, err := devRepo.GetAll(nil, nil)
	if err != nil {
		panic(err)
	}
	exportToJSON("devices.json", devs)

	// 3. Export Users
	fmt.Println("Fetching Users...")
	userRepo := sqlconnect.NewUserRepository(db)
	users, err := userRepo.GetAll()
	if err != nil {
		panic(err)
	}
	exportToJSON("users.json", users)

	// 4. Export VLANs
	fmt.Println("Fetching VLANs...")
	vlanRepo := sqlconnect.NewVLANRepository(db)
	vlans, err := vlanRepo.GetAll(nil, nil)
	if err != nil {
		panic(err)
	}
	exportToJSON("vlans.json", vlans)

	// 5. Export Interfaces
	fmt.Println("Fetching Interfaces...")
	interfaceRepo := sqlconnect.NewInterfaceRepository(db)
	interfaces, err := interfaceRepo.GetAll(nil, nil)
	if err != nil {
		panic(err)
	}
	exportToJSON("interfaces.json", interfaces)

	fmt.Println("All exports completed successfully.")
}
