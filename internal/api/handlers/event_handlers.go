package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
)

func GetEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	limit, offset, page := pkgutils.ParsePagination(r)

	repo := sqlconnect.NewEventRepository(db)
	events, err := repo.GetAll(limit, offset)
	if err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalCount:  0, // Set later
		},
		Data: events,
	}

	totalCount, err := repo.Count()
	if err == nil {
		response.Meta.TotalCount = totalCount
		response.Meta.TotalPages = pkgutils.CalculateTotalPages(totalCount, limit)
	}

	json.NewEncoder(w).Encode(response)
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var event models.Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	repo := sqlconnect.NewEventRepository(db)
	created, err := repo.Create(event)
	if err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}
