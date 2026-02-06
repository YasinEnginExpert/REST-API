package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
)

func GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	limit, offset, page := pkgutils.ParsePagination(r)

	repo := sqlconnect.NewAuditRepository(db)
	logs, err := repo.GetAll(limit, offset)
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
		Data: logs,
	}

	totalCount, err := repo.Count()
	if err == nil {
		response.Meta.TotalCount = totalCount
		response.Meta.TotalPages = pkgutils.CalculateTotalPages(totalCount, limit)
	}

	json.NewEncoder(w).Encode(response)
}
