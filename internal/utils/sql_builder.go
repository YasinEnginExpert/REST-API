package utils

import (
	"fmt"
	"strings"
)

// BuildUpdateQuery constructs a dynamic UPDATE query based on a map of updates.
// It returns the query string and the arguments slice.
// allowdFields: a map of field names that are allowed to be updated.
// id: the ID of the record to update (will be the last argument).
func BuildUpdateQuery(tableName string, updates map[string]interface{}, allowedFields map[string]bool, id interface{}) (string, []interface{}, error) {
	var setClauses []string
	var args []interface{}
	// Start argIdCounter at 1
	var argIdCounter = 1

	for field, value := range updates {
		// potential simple validation to avoid SQL injection on field names (though allowedFields handles this)
		if allowedFields[field] {
			setClauses = append(setClauses, fmt.Sprintf("%s=$%d", field, argIdCounter))
			args = append(args, value)
			argIdCounter++
		}
	}

	if len(setClauses) == 0 {
		return "", nil, fmt.Errorf("no valid fields provided for update")
	}

	// Just a special handling if "updated_at" isn't passed but exists in schema,
	// usually callers handle it or we can add an option.
	// For now, let's keep it generic. The caller can add updated_at to the map if needed OR append it manually.
	// But to match current logic which forces updated_at=CURRENT_TIMESTAMP for devices:
	// We might leave that to the caller to append to the query string if they need special SQL keywords.
	// However, to keep this generic, let's stick to what's passed.

	query := fmt.Sprintf("UPDATE %s SET %s WHERE id=$%d", tableName, strings.Join(setClauses, ", "), argIdCounter)
	args = append(args, id)

	return query, args, nil
}
