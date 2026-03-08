# Stage 1: Build Phase
FROM rust:1.84-slim AS builder
WORKDIR /app

# Install build dependencies (often required for OpenSSL, cc)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

COPY Cargo.toml Cargo.lock* ./
COPY src ./src

# Build for release
RUN cargo build --release

# Stage 2: Production Phase
FROM debian:bookworm-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/backend /usr/local/bin/backend

# Use $PORT provided by platform like Railway (defaults to 8080 inside code)
EXPOSE 8080

CMD ["backend"]
