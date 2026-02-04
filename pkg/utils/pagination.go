package utils

import (
	"net/http"
	"strconv"
)

// PaginationMeta holds the metadata for paginated responses
type PaginationMeta struct {
	CurrentPage int `json:"current_page"`
	Limit       int `json:"limit"`
	TotalPages  int `json:"total_pages"`
	TotalCount  int `json:"total_count"`
}

// PaginatedResponse is the standard wrapper for list endpoints
type PaginatedResponse struct {
	Meta PaginationMeta `json:"meta"`
	Data interface{}    `json:"data"`
}

// ParsePagination extracts page and limit from the request query params.
// It returns limit, offset, and the parsed page number.
// Defaults: page=1, limit=10
func ParsePagination(r *http.Request) (int, int, int) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	// Hard limit to prevent abuse
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit
	return limit, offset, page
}

// CalculateTotalPages calculates the total number of pages based on count and limit
func CalculateTotalPages(totalCount int, limit int) int {
	if limit == 0 {
		return 0
	}
	totalPages := totalCount / limit
	if totalCount%limit > 0 {
		totalPages++
	}
	return totalPages
}
