# Build Stage
FROM golang:alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

WORKDIR /app

# Copy Go module files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
# CGO_ENABLED=0 creates a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api cmd/api/main.go

# Runtime Stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies (ca-certificates for HTTPS, openssl for cert gen if needed)
RUN apk add --no-cache ca-certificates openssl tzdata

# Copy binary from builder
COPY --from=builder /app/bin/api .

# Copy templates and migrations
COPY --from=builder /app/internal/mailer/templates ./internal/mailer/templates
COPY --from=builder /app/migrations ./migrations

# Create directory for certs
RUN mkdir certs

# Expose API port
EXPOSE 3000

# Run the application
CMD ["./api"]
