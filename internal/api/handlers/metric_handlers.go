package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"

	"github.com/gorilla/mux"
)

func GetMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	limit, offset, page := pkgutils.ParsePagination(r)
	sortBy := r.URL.Query().Get("sort")

	repo := sqlconnect.NewMetricRepository(db)
	metrics, err := repo.GetAll(limit, offset, sortBy)
	if err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalCount:  0,
		},
		Data: metrics,
	}

	totalCount, err := repo.Count()
	if err == nil {
		response.Meta.TotalCount = totalCount
		response.Meta.TotalPages = pkgutils.CalculateTotalPages(totalCount, limit)
	}

	json.NewEncoder(w).Encode(response)
}

func GetLatestDeviceMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	deviceID := vars["id"]

	repo := sqlconnect.NewMetricRepository(db)
	metric, err := repo.GetLatestByDevice(deviceID)
	if err != nil {
		pkgutils.JSONError(w, "Metrics not found for this device", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(metric)
}
