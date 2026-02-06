package utils

import (
	"strings"
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "Secret123!"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash == "" {
		t.Error("HashPassword returned empty string")
	}

	// Verify format
	// Expected: $argon2id$v=19$m=65536,t=1,p=4$salt$hash
	parts := strings.Split(hash, "$")
	if len(parts) != 6 {
		t.Errorf("Hash format invalid, expected 6 parts, got %d. Hash: %s", len(parts), hash)
	}

	if parts[1] != "argon2id" {
		t.Errorf("Expected algorithm 'argon2id', got '%s'", parts[1])
	}
}

func TestCheckPassword(t *testing.T) {
	password := "MySecurePassword"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to generate hash: %v", err)
	}

	// 1. Correct password
	match, err := CheckPassword(password, hash)
	if err != nil {
		t.Errorf("CheckPassword returned error for valid password: %v", err)
	}
	if !match {
		t.Error("CheckPassword returned false for valid password")
	}

	// 2. Incorrect password
	match, err = CheckPassword("WrongPassword", hash)
	if err != nil {
		t.Errorf("CheckPassword returned error for invalid password: %v", err)
	}
	if match {
		t.Error("CheckPassword returned true for invalid password")
	}

	// 3. Different Parameters (Robustness Check)
	// We simulate a hash created with OTHER parameters than the current default constants
	// m=1024 (1MB), t=2, p=1

	invalidParamHash := "$argon2id$v=19$m=abc,t=1,p=4$salt$hash"
	_, err = CheckPassword("any", invalidParamHash)
	if err == nil {
		t.Error("Expected error for invalid param format, got nil")
	} else if err.Error() != "invalid hash parameters" {
		t.Errorf("Expected 'invalid hash parameters' error, got '%v'", err)
	}
}
