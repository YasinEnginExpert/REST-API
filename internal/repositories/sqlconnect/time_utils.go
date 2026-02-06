package sqlconnect

import (
	"database/sql"
	"time"
)

func formatNullTime(t sql.NullTime) string {
	if !t.Valid {
		return ""
	}
	return t.Time.Format(time.RFC3339Nano)
}

func formatTime(t time.Time) string {
	return t.Format(time.RFC3339Nano)
}
