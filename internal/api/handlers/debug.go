package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/repositories/sqlconnect"
)

func DebugLocationCount(w http.ResponseWriter, r *http.Request) {
	repo := sqlconnect.NewLocationRepository(db)
	count, err := repo.Count(map[string]string{})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}
