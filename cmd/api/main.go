package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"
	"restapi/internal/config"
	"restapi/internal/repositories/sqlconnect"
	"restapi/internal/router"
	pkgutils "restapi/pkg/utils"
)

func main() {

	// 1. Load Configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize JWT
	if err := pkgutils.ConfigureJWT(cfg.JWT.Secret, cfg.JWT.Expiration); err != nil {
		log.Fatalf("Failed to configure JWT: %v", err)
	}

	// 2. Connect to default 'postgres' database to check/create target DB
	// We use the default DSN generated from config
	defaultDSN := cfg.Database.GetDefaultDSN()

	tempDB, err := sqlconnect.Connect(defaultDSN)
	if err != nil {

		log.Fatal("Could not connect to postgres instance:", err)
	}

	// Check if database exists
	var exists bool
	checkQuery := fmt.Sprintf("SELECT EXISTS(SELECT datname FROM pg_catalog.pg_database WHERE datname = '%s')", cfg.Database.Name)
	err = tempDB.QueryRow(checkQuery).Scan(&exists)
	if err != nil {
		log.Fatal("Failed to check database existence:", err)
	}

	if !exists {
		log.Printf("Database '%s' does not exist. Creating...", cfg.Database.Name)
		_, err = tempDB.Exec(fmt.Sprintf("CREATE DATABASE %s", cfg.Database.Name))
		if err != nil {
			log.Fatal("Failed to create database:", err)
		}
		log.Println("Database created successfully.")
	} else {
		log.Printf("Database '%s' already exists.", cfg.Database.Name)
	}
	tempDB.Close()

	// 3. Connect to the actual target database
	dsn := cfg.Database.GetDSN()
	db, err := sqlconnect.Connect(dsn)
	if err != nil {
		log.Fatal("Cannot connect to target database:", err)
	}
	defer db.Close()

	// Inject DB into handlers
	handlers.SetDB(db)

	// Auto-Run Migrations
	fmt.Println("Checking database schema...")
	migrationFile := "migrations/schema.sql"
	// Check if file exists roughly (optional, os.ReadFile handles it)
	// Note: We use relative path assuming execution from project root
	sqlScript, err := os.ReadFile(migrationFile)
	if err != nil {
		log.Printf("Warning: Could not read %s: %v. Database might not be initialized if not already setup.\n", migrationFile, err)
	} else {
		// Execute SQL script
		_, err = db.Exec(string(sqlScript))
		if err != nil {
			log.Printf("Warning: Migration failed: %v. (This might be okay if tables exist)\n", err)
		} else {
			log.Println("Database schema updated successfully!")
		}
	}

	// Initialize routes
	router := router.Routes()

	// Configure TLS (Disabled)
	/*
		tlsConfig := &tls.Config{
			MinVersion: tls.VersionTLS12,
			ClientAuth: tls.NoClientCert,
		}
	*/

	// Create a custom Server
	// CRITICAL FIX: Wrap router with Cors middleware globally to handle OPTIONS requests
	// before the router even tries to match paths.
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: middlewares.Cors(router),
	}

	// Enable http2 (Optional, often requires TLS but can work with h2c)
	// http2.ConfigureServer(server, &http2.Server{})

	fmt.Println("Server is running on port:", cfg.Server.Port, "(HTTP)")

	// Use standard HTTP to avoid self-signed cert issues
	err = server.ListenAndServe()
	if err != nil {
		log.Fatalln("Could not start server", err)
	}
}
