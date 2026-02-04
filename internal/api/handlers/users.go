package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
	"time"

	"github.com/gorilla/mux"
)

// GetUsers handles GET requests for listing users
func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRepo := sqlconnect.NewUserRepository(db)
	users, err := userRepo.GetAll()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch users").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(users)
}

// CreateUser handles POST requests to create a new user
func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := user.Validate(); err != nil {
		pkgutils.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	userRepo := sqlconnect.NewUserRepository(db)
	createdUser, err := userRepo.Create(user)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to create user").Error(), http.StatusInternalServerError)
		return
	}

	// Password field should be empty in response
	createdUser.Password = ""

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUser)
}

// GetUser handles GET requests for a single user
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	userRepo := sqlconnect.NewUserRepository(db)
	user, err := userRepo.GetByID(id)

	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch user").Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
}

// UpdateUser handles PUT requests
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	user.ID = id // Ensure ID is set for update

	userRepo := sqlconnect.NewUserRepository(db)
	rowsAffected, err := userRepo.Update(user)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update user").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "User not found", http.StatusNotFound)
		return
	}

	user.Password = "" // Ensure password is not echoed back
	json.NewEncoder(w).Encode(user)
}

// DeleteUser handles DELETE requests
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userRepo := sqlconnect.NewUserRepository(db)
	rowsAffected, err := userRepo.Delete(id)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to delete user").Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		pkgutils.JSONError(w, "User not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req models.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if req.Username == "" || req.Password == "" {
		pkgutils.JSONError(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	userRepo := sqlconnect.NewUserRepository(db)
	user, err := userRepo.GetByUsername(req.Username)
	if err == sql.ErrNoRows {
		pkgutils.JSONError(w, "Invalid credentials", http.StatusUnauthorized) // Security: don't restrict to "User not found"
		return
	} else if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Database error").Error(), http.StatusInternalServerError)
		return
	}

	if user.InactiveStatus {
		pkgutils.JSONError(w, "Account is inactive", http.StatusForbidden)
		return
	}

	// Verify Password
	match, err := pkgutils.CheckPassword(req.Password, user.Password)
	if err != nil {
		pkgutils.JSONError(w, "Error verifying password", http.StatusInternalServerError)
		return
	}

	if !match {
		pkgutils.JSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	tokenString, err := pkgutils.SignToken(string(user.ID), req.Username, user.Role)
	if err != nil {
		pkgutils.JSONError(w, "Could not create login token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "Bearer",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   3600 * 24, // 24 hours
		HttpOnly: true,
		Secure:   false, // Set to true in production
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: http.SameSiteStrictMode,
	})

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"status": "success", "message": "Login successful", "token": "%s"}`, tokenString)))
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "Bearer",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		SameSite: http.SameSiteStrictMode,
	})
	// For JWT, logout is usually client-side (delete token).
	// Server-side invalidation requires a blacklist/Redis, which is future work.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Logged out"}`))
}
