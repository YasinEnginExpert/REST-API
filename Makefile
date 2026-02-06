# ==================================================================================== #
#  REST API PROJECT - ULTIMATE MAKEFILE
#  "Automation at its finest."
# ==================================================================================== #

# --- Variables ---
BINARY_NAME=bin/api
ifeq ($(OS),Windows_NT)
    BINARY_NAME=bin/api.exe
endif
MAIN_FILE=cmd/api/main.go
CERTS_DIR=certs
COMPOSE_FILE=docker-compose.yml
DOCKER_IMAGE=restapi-app

# --- Colors ---
GREEN  := $(shell printf "\033[32m")
YELLOW := $(shell printf "\033[33m")
CYAN   := $(shell printf "\033[36m")
RESET  := $(shell printf "\033[0m")

# --- OS Detection ---
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    RM := del /Q
    RM_DIR := rmdir /S /Q
    MKDIR := mkdir
    # Windows doesn't handle ANSI codes well in default cmd, but we'll define them for Bash/PowerShell
    GREEN  := 
    YELLOW := 
    CYAN   := 
    RESET  := 
else
    DETECTED_OS := $(shell uname -s)
    RM := rm -f
    RM_DIR := rm -rf
    MKDIR := mkdir -p
endif

.PHONY: all build run test clean up down restart gen-certs help reset_db logs shell fmt vet tidy docker-build start

# Default target
all: help

# ==================================================================================== #
#  HELPERS
# ==================================================================================== #

help: ## Show this help message
	@echo ""
	@echo "REST API Project Management"
	@echo "Available targets:"
	@echo ""
	@echo "  run             Run the application directly (no docker)"
	@echo "  build           Build the Go binary"
	@echo "  test            Run all tests with verbose output"
	@echo "  clean           Remove build artifacts"
	@echo "  fmt             Format all Go code"
	@echo "  vet             Run static analysis (go vet)"
	@echo "  tidy            Clean up go.mod and go.sum"
	@echo "  up              Start all services (Postgres, MailHog, API)"
	@echo "  down            Stop and remove all containers"
	@echo "  restart         Restart the environment"
	@echo "  logs            View real-time logs from all containers"
	@echo "  shell           Open a shell inside the running API container"
	@echo "  docker-build    Force rebuild the API Docker image"
	@echo "  start           One-liner to start everything (UP + Auto-seed)"
	@echo "  reset_db        [Warning] Destroy DB volume and restart"
	@echo "  gen-certs       Generate self-signed SSL certificates for development"
	@echo ""

# ==================================================================================== #
#  DEVELOPMENT
# ==================================================================================== #

run: ## Run the application directly (no docker)
	@echo "$(YELLOW)Running application locally...$(RESET)"
	go run $(MAIN_FILE)

build: ## Build the Go binary
	@echo "$(YELLOW)Building binary...$(RESET)"
	$(MKDIR) bin
	go build -ldflags="-s -w" -o $(BINARY_NAME) $(MAIN_FILE)
	@echo "$(GREEN)Build complete: $(BINARY_NAME)$(RESET)"

test: ## Run all tests with verbose output
	@echo "$(YELLOW)Running tests...$(RESET)"
	go test ./... -v

clean: ## Remove build artifacts
	@echo "$(YELLOW)Cleaning artifacts...$(RESET)"
ifeq ($(OS),Windows_NT)
	if exist bin $(RM_DIR) bin
else
	$(RM_DIR) bin
endif
	@echo "$(GREEN)Clean complete.$(RESET)"

# ==================================================================================== #
#  CODE QUALITY
# ==================================================================================== #

fmt: ## Format all Go code
	@echo "$(YELLOW)Formatting code...$(RESET)"
	go fmt ./...

vet: ## Run static analysis (go vet)
	@echo "$(YELLOW)Running code analysis...$(RESET)"
	go vet ./...

tidy: ## Clean up go.mod and go.sum
	@echo "$(YELLOW)Tidying up modules...$(RESET)"
	go mod tidy

# ==================================================================================== #
#  DOCKER & INFRASTRUCTURE
# ==================================================================================== #

up: ## Start all services (Postgres, MailHog, API) in background
	@echo "$(YELLOW)Starting Docker environment...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Environment is up! Access Frontend at http://localhost and API at http://localhost:3000$(RESET)"

start: up ## Alias for 'make up'

down: ## Stop and remove all containers
	@echo "$(YELLOW)Stopping containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Environment stopped.$(RESET)"

restart: down up ## Restart the environment

logs: ## View real-time logs from all containers
	docker-compose -f $(COMPOSE_FILE) logs -f

shell: ## Open a shell inside the running API container
	docker exec -it restapi-app sh

docker-build: ## Force rebuild the API Docker image
	@echo "$(YELLOW)Rebuilding API Docker image (pulling latest base)...$(RESET)"
	docker build --pull -t $(DOCKER_IMAGE) .
	@echo "$(GREEN)Image built successfully!$(RESET)"

reset_db: ## [Warning] Destroy DB volume and restart
	@echo "$(YELLOW)Resetting database (Nuclear Option)...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)Database volume destroyed.$(RESET)"
	@echo "Run 'make up' to start fresh."

# ==================================================================================== #
#  SECURITY
# ==================================================================================== #

gen-certs: ## Generate self-signed SSL certificates for development
	@echo "$(YELLOW)Generating certificates...$(RESET)"
	$(MKDIR) $(CERTS_DIR)
	openssl genrsa -out $(CERTS_DIR)/ca.key 2048
	openssl req -x509 -new -nodes -key $(CERTS_DIR)/ca.key -sha256 -days 1825 -out $(CERTS_DIR)/ca.pem -subj "//C=TR/ST=Turkey/L=Istanbul/O=Netreka Dev/CN=Netreka Root CA"
	
	openssl genrsa -out $(CERTS_DIR)/key.pem 2048
	openssl req -new -key $(CERTS_DIR)/key.pem -out $(CERTS_DIR)/server.csr -config $(CERTS_DIR)/openssl.conf
	
	openssl x509 -req -in $(CERTS_DIR)/server.csr -CA $(CERTS_DIR)/ca.pem -CAkey $(CERTS_DIR)/ca.key -CAcreateserial -out $(CERTS_DIR)/cert.pem -days 365 -sha256 -extfile $(CERTS_DIR)/openssl.conf -extensions v3_req
	@echo "$(GREEN)Certificates generated in /$(CERTS_DIR)$(RESET)"
