# Project Variables
BINARY_NAME=bin/api.exe
MAIN_FILE=cmd/api/main.go
CERTS_DIR=certs

.PHONY: all build run test clean up down gen-certs help start

# Default target
all: build

help: ## Display this help screen
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##";} /^[a-zA-Z_-]+:.*?##/ { printf "  %-15s %s\n", $$1, $$2 } /^##@/ { printf "\n%s\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

run: ## Run the application directly
	@echo "Running application..."
	go run $(MAIN_FILE)

build: ## Build the binary
	@echo "Building binary..."
	@mkdir -p bin
	go build -o $(BINARY_NAME) $(MAIN_FILE)
	@echo "Build complete: $(BINARY_NAME)"

test: ## Run tests
	@echo "Running tests..."
	go test ./... -v

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin
	@echo "Clean complete"

reset: down ## Stop containers AND wipe database volume (Fresh Start)
	@echo "Wiping database volume..."
	docker-compose down -v
	@echo "Database wiped! Run 'make start' to re-seed."

##@ Docker

up: ## Start Docker containers in background
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Docker containers started!"

down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "Docker containers stopped!"

start: up run ## Start Docker and then run the app

##@ Security

gen-certs: ## Generate self-signed certificates for development
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

	@echo "Creating Client PFx for Postman/Browser (Password: changeit)..."
	openssl pkcs12 -export -out $(CERTS_DIR)/client.p12 -inkey $(CERTS_DIR)/client.key -in $(CERTS_DIR)/client.pem -passout pass:changeit

	@echo "Done! Import $(CERTS_DIR)/ca.pem to your Trusted Root Store."
