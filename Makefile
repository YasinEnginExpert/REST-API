# Project Variables
BINARY_NAME=bin/api.exe
MAIN_FILE=cmd/api/main.go
CERTS_DIR=certs

# Colors for nicer output
GREEN=\033[0;32m
CYAN=\033[0;36m
NC=\033[0m # No Color

.PHONY: all build run test clean up down gen-certs help start

# Default target
all: build

help: ## Display this help screen
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"; printf "\033[36m\033[0m"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

run: ## Run the application directly
	@echo "$(GREEN)Running application...$(NC)"
	go run $(MAIN_FILE)

build: ## Build the binary
	@echo "$(GREEN)Building binary...$(NC)"
	@mkdir -p bin
	go build -o $(BINARY_NAME) $(MAIN_FILE)
	@echo "$(GREEN)Build complete: $(BINARY_NAME)$(NC)"

test: ## Run tests
	@echo "$(GREEN)Running tests...$(NC)"
	go test ./... -v

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning...$(NC)"
	@rm -rf bin
	@echo "$(GREEN)Clean complete$(NC)"

##@ Docker

up: ## Start Docker containers in background
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Docker containers started!$(NC)"

down: ## Stop Docker containers
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)Docker containers stopped!$(NC)"

start: up run ## Start Docker and then run the app

##@ Security

gen-certs: ## Generate self-signed certificates for development
	@echo "$(CYAN)Creating CA...$(NC)"
	openssl genrsa -out $(CERTS_DIR)/ca.key 2048
	openssl req -x509 -new -nodes -key $(CERTS_DIR)/ca.key -sha256 -days 1825 -out $(CERTS_DIR)/ca.pem -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevRootCA/CN=MyDevRootCA"
	
	@echo "$(CYAN)Creating Server Key and CSR...$(NC)"
	openssl genrsa -out $(CERTS_DIR)/key.pem 2048
	openssl req -new -key $(CERTS_DIR)/key.pem -out $(CERTS_DIR)/server.csr -config $(CERTS_DIR)/openssl.conf
	
	@echo "$(CYAN)Signing Server Certificate...$(NC)"
	openssl x509 -req -in $(CERTS_DIR)/server.csr -CA $(CERTS_DIR)/ca.pem -CAkey $(CERTS_DIR)/ca.key -CAcreateserial -out $(CERTS_DIR)/cert.pem -days 365 -sha256 -extfile $(CERTS_DIR)/openssl.conf -extensions v3_req

	@echo "$(CYAN)Creating Client Key and CSR...$(NC)"
	openssl genrsa -out $(CERTS_DIR)/client.key 2048
	openssl req -new -key $(CERTS_DIR)/client.key -out $(CERTS_DIR)/client.csr -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevClient/CN=MyDevClient"

	@echo "$(CYAN)Signing Client Certificate...$(NC)"
	openssl x509 -req -in $(CERTS_DIR)/client.csr -CA $(CERTS_DIR)/ca.pem -CAkey $(CERTS_DIR)/ca.key -CAcreateserial -out $(CERTS_DIR)/client.pem -days 365 -sha256 -extfile $(CERTS_DIR)/openssl.conf -extensions v3_req

	@echo "$(CYAN)Creating Client PFx for Postman/Browser (Password: changeit)...$(NC)"
	openssl pkcs12 -export -out $(CERTS_DIR)/client.p12 -inkey $(CERTS_DIR)/client.key -in $(CERTS_DIR)/client.pem -passout pass:changeit

	@echo "$(GREEN)Done! Import $(CERTS_DIR)/ca.pem to your Trusted Root Store.$(NC)"
