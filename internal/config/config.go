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
	SMTP     SMTPConfig
}

type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	Sender   string
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
		SMTP: SMTPConfig{
			Host:     getEnv("MAIL_HOST", "mailhog"),
			Port:     getEnvInt("MAIL_PORT", 1025),
			Username: getEnv("MAIL_USERNAME", ""),
			Password: getEnv("MAIL_PASSWORD", ""),
			Sender:   getEnv("FROM_ADDRESS", "no-reply@netreka.local"),
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

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		var i int
		if _, err := fmt.Sscanf(value, "%d", &i); err == nil {
			return i
		}
	}
	return fallback
}
