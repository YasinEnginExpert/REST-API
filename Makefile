# ==================================================================================== #
#  REST API PROJECT - THE ULTIMATE BUILD TOOL
#  "Where robust code meets elegant architecture!"
# ==================================================================================== #

# ==============================
# Detect OS for cross-platform compatibility
# ==============================
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    RM := del /Q
    RM_DIR := rmdir /S /Q
    PATH_SEP := \\
    MKDIR := mkdir
else
    DETECTED_OS := $(shell uname -s)
    RM := rm -f
    RM_DIR := rm -rf
    PATH_SEP := /
    MKDIR := mkdir -p
endif

# ==============================
# Variables
# ==============================
BINARY_NAME=bin/api.exe
MAIN_FILE=cmd/api/main.go
CERTS_DIR=certs
COMPOSE_FILE=docker-compose.yml

.PHONY: all build run test clean up down restart gen-certs help reset_db

# Default target
all: build

# ==============================
# Help - The "I don't know what I'm doing" command
# ==============================
help:
	@echo "Available targets:"
	@echo "  up           - Start Docker containers (DB + Admin)"
	@echo "  down         - Stop Docker containers"
	@echo "  restart      - Restart Docker containers"
	@echo "  build        - Build the Go application binary"
	@echo "  run          - Run the application directly (go run)"
	@echo "  start        - Start Docker containers AND run the app"
	@echo "  test         - Run all tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  reset_db     - The nuclear option (Stops containers & wipes DB volume)"
	@echo "  gen-certs    - Generate development SSL certificates"
	@echo ""
	@echo "Detected OS: $(DETECTED_OS)"

# ==============================
# Development
# ==============================

run: ## Run the application directly
	@echo "Running application..."
	go run $(MAIN_FILE)

build: ## Build the binary
	@echo "Building binary..."
ifeq ($(OS),Windows_NT)
	if not exist bin mkdir bin
	go build -o $(BINARY_NAME) $(MAIN_FILE)
else
	$(MKDIR) bin
	go build -o $(BINARY_NAME) $(MAIN_FILE)
endif
	@echo "Build complete: $(BINARY_NAME)"

test: ## Run tests
	@echo "Running tests..."
	go test ./... -v

clean: ## Clean build artifacts
	@echo "Cleaning..."
ifeq ($(OS),Windows_NT)
	if exist bin $(RM_DIR) bin
else
	$(RM_DIR) bin
endif
	@echo "Clean complete"

# ==============================
# Docker
# ==============================

up: ## Start Docker containers
	@echo "Starting Docker containers..."
ifeq ($(OS),Windows_NT)
	docker-compose -f $(COMPOSE_FILE) up -d
else
	docker-compose -f $(COMPOSE_FILE) up -d
endif
	@echo "Docker containers started!"

down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "Docker containers stopped!"

restart: down up ## Restart Docker containers

start: up run ## Start Docker and then run the app

reset_db: ## Stop containers AND wipe database volume
	@echo "Resetting database... (Incoming kaboom!)"
	docker-compose -f $(COMPOSE_FILE) down -v
ifeq ($(OS),Windows_NT)
	@echo "Database volume wiped."
else
	@echo "Database volume wiped."
endif
	@echo "Database reset complete. Run 'make start' to re-seed."

# ==============================
# Security
# ==============================

gen-certs: ## Generate self-signed certificates
	@echo "Creating CA..."
	openssl genrsa -out $(CERTS_DIR)/ca.key 2048
	openssl req -x509 -new -nodes -key $(CERTS_DIR)/ca.key -sha256 -days 1825 -out $(CERTS_DIR)/ca.pem -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevRootCA/CN=MyDevRootCA"
	
	@echo "Creating Server Key and CSR..."
	openssl genrsa -out $(CERTS_DIR)/key.pem 2048
	openssl req -new -key $(CERTS_DIR)/key.pem -out $(CERTS_DIR)/server.csr -config $(CERTS_DIR)/openssl.conf
	
	@echo "Signing Server Certificate..."
	openssl x509 -req -in $(CERTS_DIR)/server.csr -CA $(CERTS_DIR)/ca.pem -CAkey $(CERTS_DIR)/ca.key -CAcreateserial -out $(CERTS_DIR)/cert.pem -days 365 -sha256 -extfile $(CERTS_DIR)/openssl.conf -extensions v3_req

	@echo "Creating Client Key and CSR..."
	openssl genrsa -out $(CERTS_DIR)/client.key 2048
	openssl req -new -key $(CERTS_DIR)/client.key -out $(CERTS_DIR)/client.csr -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevClient/CN=MyDevClient"

	@echo "Signing Client Certificate..."
	openssl x509 -req -in $(CERTS_DIR)/client.csr -CA $(CERTS_DIR)/ca.pem -CAkey $(CERTS_DIR)/ca.key -CAcreateserial -out $(CERTS_DIR)/client.pem -days 365 -sha256 -extfile $(CERTS_DIR)/openssl.conf -extensions v3_req

	@echo "Creating Client PFx for Postman (Password: changeit)..."
	openssl pkcs12 -export -out $(CERTS_DIR)/client.p12 -inkey $(CERTS_DIR)/client.key -in $(CERTS_DIR)/client.pem -passout pass:changeit

	@echo "Done! Import $(CERTS_DIR)/ca.pem to your Trusted Root Store."
