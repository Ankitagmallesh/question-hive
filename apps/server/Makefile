# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=question-hive-server
BINARY_UNIX=$(BINARY_NAME)_unix

.PHONY: all build clean test coverage deps run dev help fmt lint

# Default target
help:
	@echo "Available commands:"
	@echo "  dev      - Run the server in development mode"
	@echo "  build    - Build the server binary"
	@echo "  run      - Run the built server binary"
	@echo "  test     - Run all tests"
	@echo "  clean    - Clean build artifacts"
	@echo "  deps     - Install dependencies"
	@echo "  fmt      - Format Go code"
	@echo "  lint     - Run golangci-lint (if available)"

all: test build

# Development mode
dev:
	@echo "🚀 Starting Question Hive Server in development mode..."
	$(GOCMD) run main.go

# Build the server
build:
	@echo "🔨 Building Question Hive Server..."
	$(GOBUILD) -o bin/$(BINARY_NAME) -v ./main.go
	@echo "✅ Build completed: bin/$(BINARY_NAME)"

# Run the built server
run: build
	@echo "🚀 Starting Question Hive Server..."
	./bin/$(BINARY_NAME)

# Run tests
test:
	@echo "🧪 Running tests..."
	$(GOTEST) -v ./...

# Test coverage
coverage:
	$(GOTEST) -v ./... -coverprofile=coverage.out
	$(GOCMD) tool cover -html=coverage.out

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	$(GOCLEAN)
	rm -rf bin/
	rm -f coverage.out

# Install dependencies
deps:
	@echo "📦 Installing dependencies..."
	$(GOMOD) download
	$(GOMOD) tidy

# Format Go code
fmt:
	@echo "🎨 Formatting Go code..."
	$(GOCMD) fmt ./...

# Run linter (optional - requires golangci-lint)
lint:
	@echo "🔍 Running linter..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run; \
	else \
		echo "⚠️  golangci-lint not found. Install it with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
	fi

# Check if server is running
check:
	@echo "🔍 Checking server health..."
	@curl -s http://localhost:8080/health | jq . || echo "Server not responding"

coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out

clean:
	$(GOCLEAN)
	rm -f bin/$(BINARY_NAME)
	rm -f bin/$(BINARY_UNIX)
	rm -f coverage.out

run:
	$(GOBUILD) -o bin/$(BINARY_NAME) -v ./main.go
	./bin/$(BINARY_NAME)

dev:
	$(GOCMD) run main.go

deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Cross compilation
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -o bin/$(BINARY_UNIX) -v ./main.go

docker-build:
	docker build -t $(BINARY_NAME):latest .

install:
	$(GOGET) -u ./...
	$(GOMOD) tidy
