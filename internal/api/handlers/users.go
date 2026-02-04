package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"restapi/internal/config"
	"restapi/internal/mailer"
	"restapi/internal/models"
	"restapi/internal/repositories/sqlconnect"
	pkgutils "restapi/pkg/utils"
	"time"

	"github.com/gorilla/mux"
)

// GetUsers handles GET requests for listing users
func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	limit, offset, page := pkgutils.ParsePagination(r)
	userRepo := sqlconnect.NewUserRepository(db)

	users, err := userRepo.GetAll(limit, offset)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to fetch users").Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := userRepo.Count()
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to count users").Error(), http.StatusInternalServerError)
		return
	}

	response := pkgutils.PaginatedResponse{
		Meta: pkgutils.PaginationMeta{
			CurrentPage: page,
			Limit:       limit,
			TotalPages:  pkgutils.CalculateTotalPages(totalCount, limit),
			TotalCount:  totalCount,
		},
		Data: users,
	}

	json.NewEncoder(w).Encode(response)
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

func UpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	id := vars["id"]

	var req models.UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.NewPassword == "" {
		pkgutils.JSONError(w, "New password is required", http.StatusBadRequest)
		return
	}

	userRepo := sqlconnect.NewUserRepository(db)
	err := userRepo.UpdatePassword(id, req.NewPassword)
	if err != nil {
		pkgutils.JSONError(w, pkgutils.ErrorHandler(err, "Failed to update password").Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Password updated successfully"}`))
}

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" {
		pkgutils.JSONError(w, "Email is required", http.StatusBadRequest)
		return
	}

	cfg, err := config.Load()
	if err != nil {
		pkgutils.JSONError(w, "Configuration error", http.StatusInternalServerError)
		return
	}

	userRepo := sqlconnect.NewUserRepository(db)
	user, err := userRepo.GetByEmail(req.Email)

	// Security: Always return success even if user not found to prevent email enumeration
	if err != nil {
		if err == sql.ErrNoRows {
			// User not found, but we say "If email exists..."
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status": "success", "message": "If your email is registered, you will receive a reset code."}`))
			return
		}
		pkgutils.JSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Generate a 6-digit random code
	// In production, use crypto/rand. For simplicity here:
	// A secure 6-digit code
	code, err := pkgutils.GenerateRandomCode(6)
	if err != nil {
		pkgutils.JSONError(w, "Failed to generate code", http.StatusInternalServerError)
		return
	}

	if err := userRepo.SetPasswordResetCode(user.ID, code); err != nil {
		pkgutils.JSONError(w, "Failed to save reset code", http.StatusInternalServerError)
		return
	}

	// Send Reset Email
	mailClient := mailer.New(cfg.SMTP)
	data := struct {
		Code string
	}{
		Code: code,
	}

	// Note: Ideally, this should be done asynchronously (goroutine or worker)
	go func() {
		// Use "mail" mapping to "mail.html.gohtml" and "mail.plain.gohtml"
		err := mailClient.Send(req.Email, "Password Reset Code", "mail", data)
		if err != nil {
			fmt.Printf("Failed to send email to %s: %v\n", req.Email, err)
		} else {
			fmt.Printf("Email sent to %s with code %s\n", req.Email, code)
		}
	}()

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "If your email is registered, you will receive a reset code."}`))
}

func ResetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	code := vars["resetCode"]

	type request struct {
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		pkgutils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.NewPassword != req.ConfirmPassword {
		pkgutils.JSONError(w, "Passwords do not match", http.StatusBadRequest)
		return
	}

	userRepo := sqlconnect.NewUserRepository(db)

	// Verify code exists and get user
	user, err := userRepo.GetByResetCode(code)
	if err != nil {
		if err == sql.ErrNoRows {
			pkgutils.JSONError(w, "Invalid or expired reset code", http.StatusNotFound)
			return
		}
		pkgutils.JSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Update password and clear code
	if err := userRepo.ResetPassword(user.ID, req.NewPassword); err != nil {
		pkgutils.JSONError(w, "Failed to reset password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Password reset successfully"}`))
}
