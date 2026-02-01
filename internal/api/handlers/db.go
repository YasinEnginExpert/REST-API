package handlers

import (
	"database/sql"
)

var db *sql.DB

// SetDB sets the database connection for the handlers package
func SetDB(database *sql.DB) {
	db = database
}
