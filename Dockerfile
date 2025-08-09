FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application from the main directory
RUN CGO_ENABLED=0 GOOS=linux go build -o indexer ./main

FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/indexer .

# Run the indexer
CMD ["./indexer"]