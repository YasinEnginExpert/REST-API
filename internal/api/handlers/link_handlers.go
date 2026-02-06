package handlers

import (
	"encoding/json"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
	"strings"

	"github.com/gorilla/mux"
)

// GetLinks handles GET requests for listing links
func GetLinks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	limit, offset, page := pkgutils.ParsePagination(r)
	filters := make(map[string]string)
	queryParams := r.URL.Query()

	for k, v := range queryParams {
		if k == "sortby" || k == "page" || k == "limit" {
			continue
		}
		if len(v) > 0 && v[0] != "" {
			filters[k] = v[0]
		}
	}

	repo := sqlconnect.NewLinkRepository(db)
	links, err := repo.GetAll(filters, limit, offset)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch links").Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := repo.Count(filters)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count links").Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalPages:  pkgutils.CalculateTotalPages(totalCount, limit),
			TotalCount:  totalCount,
		},
		Data: links,
	}

	json.NewEncoder(w).Encode(response)
}

// CreateLink handles POST requests
func CreateLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var link models.Link

	if err := json.NewDecoder(r.Body).Decode(&link); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Basic Validation
	if link.AInterfaceID == "" || link.BInterfaceID == "" {
		pkgutils.JSONError(w, "Both a_interface_id and b_interface_id are required", http.StatusBadRequest)
		return
	}
	if link.AInterfaceID == link.BInterfaceID {
		pkgutils.JSONError(w, "Cannot link an interface to itself", http.StatusBadRequest)
		return
	}
	if link.Discovery == "" {
		link.Discovery = "manual"
	}
	if link.Status == "" {
		link.Status = "up"
	}

	repo := sqlconnect.NewLinkRepository(db)
	createdLink, err := repo.Create(link)
	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
			pkgutils.JSONError(w, "Link between these interfaces already exists", http.StatusConflict)
			return
		}
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create link").Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdLink)
}

// GetLink handles GET Single Link
func GetLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewLinkRepository(db)
	l, err := repo.GetByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			pkgutils.JSONError(w, "Link not found", http.StatusNotFound)
		} else {
			pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch link").Error(), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(l)
}

// DeleteLink handles DELETE requests
func DeleteLink(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	repo := sqlconnect.NewLinkRepository(db)
	rowsAffected, err := repo.Delete(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete link").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Link not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdateLink handles PUT requests (Updates status/discovery)
func UpdateLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var link models.Link
	if err := json.NewDecoder(r.Body).Decode(&link); err != nil {
		pkgutils.JSONError(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	link.ID = id
	repo := sqlconnect.NewLinkRepository(db)
	rowsAffected, err := repo.Update(link)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update link").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "Link not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(link)
}
