package utils

import (
	"fmt"
	"reflect"
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

// GenerateInsertQuery constructs a dynamic INSERT query based on a map of data.
// It returns the query string (with RETURNING id) and the arguments slice.
func GenerateInsertQuery(tableName string, data map[string]interface{}) (string, []interface{}, error) {
	if len(data) == 0 {
		return "", nil, fmt.Errorf("no data provided for insert")
	}

	var columns []string
	var placeholders []string
	var args []interface{}
	argIdCounter := 1

	for col, val := range data {
		columns = append(columns, col)
		placeholders = append(placeholders, fmt.Sprintf("$%d", argIdCounter))
		args = append(args, val)
		argIdCounter++
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING id",
		tableName,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "))

	return query, args, nil
}

// GetStructValues converts a struct to a map[string]interface{} using "json" tags.
// It skips fields without tags or with value "-"
// GetStructValues converts a struct to a map[string]interface{} using "db" tags (preferred) or "json" tags.
// It skips fields without tags or with value "-"
// It respects "omitempty" option in "json" tag to skip zero values.
func GetStructValues(s interface{}) (map[string]interface{}, error) {
	val := reflect.ValueOf(s)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	if val.Kind() != reflect.Struct {
		return nil, fmt.Errorf("expected struct, got %s", val.Kind())
	}

	out := make(map[string]interface{})
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)

		// 1. Try "db" tag first for column name
		dbTag := field.Tag.Get("db")
		var key string
		if dbTag != "" && dbTag != "-" {
			key = dbTag
		}

		// 2. If no db tag, fallback to json tag
		jsonTag := field.Tag.Get("json")
		if key == "" {
			if jsonTag != "" && jsonTag != "-" {
				parts := strings.Split(jsonTag, ",")
				key = parts[0]
			}
		}

		// 3. Skip if no valid key found or ignored
		if key == "" || key == "-" {
			continue
		}

		// 4. Skip "id" field usually for INSERTs (unless we want to force ID)
		// Usually databases generate serial/UUID IDs.
		if key == "id" {
			continue
		}

		// 5. Handle "omitempty" from JSON tag (or we can assume it applies to DB too if JSON has it)
		// Logic: If json has "omitempty" AND value is zero-value, skip it.
		isOmitEmpty := false
		if jsonTag != "" {
			parts := strings.Split(jsonTag, ",")
			for _, p := range parts {
				if p == "omitempty" {
					isOmitEmpty = true
					break
				}
			}
		}

		fieldVal := val.Field(i)
		if fieldVal.Kind() == reflect.Ptr {
			if fieldVal.IsNil() {
				if isOmitEmpty {
					continue
				}
				out[key] = nil
				continue
			}
			fieldVal = fieldVal.Elem()
		}

		if isOmitEmpty && fieldVal.IsZero() {
			continue
		}

		out[key] = fieldVal.Interface()
	}

	return out, nil
}
