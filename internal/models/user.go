package models

import (
	"errors"
	"strings"
)

// User represents a system user (corresponds to Exec struct concept)
type User struct {
	ID                string `json:"id" db:"id"`
	FirstName         string `json:"first_name" db:"first_name"`
	LastName          string `json:"last_name" db:"last_name"`
	Email             string `json:"email" db:"email"`
	Username          string `json:"username" db:"username"`
	Password          string `json:"password,omitempty" db:"password"` // Hashed, omitempty to avoid leaking in responses
	PasswordChangedAt string `json:"password_changed_at,omitempty" db:"password_changed_at"`
	UserCreatedAt     string `json:"user_created_at" db:"user_created_at"`
	PasswordResetCode string `json:"password_reset_code,omitempty" db:"password_reset_code"`
	InactiveStatus    bool   `json:"inactive_status" db:"inactive_status"`
	Role              string `json:"role" db:"role"`
}

// Validate checks for required fields
func (u *User) Validate() error {
	if strings.TrimSpace(u.Username) == "" {
		return errors.New("username is required")
	}
	if strings.TrimSpace(u.Email) == "" {
		return errors.New("email is required")
	}
	if strings.TrimSpace(u.Password) == "" && u.ID == "" { // Password required mainly for creation
		return errors.New("password is required")
	}
	if strings.TrimSpace(u.Role) == "" {
		return errors.New("role is required")
	}
	return nil
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"password_updated"`
	NewPassword     string `json:"new_password"`
}

type UpdatePasswordResponse struct {
	Token           string `json:"token"`
	PasswordUpdated bool   `json:"password_updated"`
}
