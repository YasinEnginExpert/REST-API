package sqlconnect

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

// Connect opens a connection to the PostgreSQL database and verifies it with a ping.
func Connect(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	log.Println("Connected to Postgres successfully!")
	return db, nil
}
