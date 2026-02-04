package config

import (
	"fmt"
	"os"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port     int
	CertFile string
	KeyFile  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type JWTConfig struct {
	Secret     string
	Expiration string
}

// Load returns the application configuration populated from environment variables
func Load() (*Config, error) {
	return &Config{
		Server: ServerConfig{
			Port:     3000, // Default port, could be env var too
			CertFile: "certs/cert.pem",
			KeyFile:  "certs/key.pem",
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "restapi"),
			SSLMode:  getEnv("DB_SSL", "disable"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "super-secret-key"),
			Expiration: getEnv("JWT_EXPIRATION", "24h"),
		},
	}, nil
}

// GetDSN returns the Data Source Name for SQL connection
func (db *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		db.Host, db.Port, db.User, db.Password, db.Name, db.SSLMode)
}

// GetDefaultDSN returns DSN for the default postgres database (for initial checks)
func (db *DatabaseConfig) GetDefaultDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=%s",
		db.Host, db.Port, db.User, db.Password, db.SSLMode)
}

// Helper to read env with default fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
