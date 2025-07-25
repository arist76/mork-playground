# Stage 1: Build MORK server
FROM rust:latest as mork-builder

# Clone and build MORK at specific commit
RUN git clone https://github.com/trueagi-io/MORK/ /mork
WORKDIR /mork

RUN apt-get update && apt-get install -y cmake && \
    git checkout 578a759d2c4962de7b4a2cd17f695c89f5e53bb4 && \
    cargo build --release --bin mork_server

# Stage 2: Build Next.js app
FROM node:18 as nextjs-builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY ./playground/ .

COPY playground/package.json playground/pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --force

# Build Next.js app
RUN pnpm build

# Stage 3: Runtime image
FROM node:18-slim
RUN apt-get update && apt-get install -y curl

# Enable pnpm in final image
RUN corepack enable

# Copy built artifacts
COPY --from=mork-builder /mork/target/release/mork_server /usr/local/bin/
COPY --from=nextjs-builder /app /app

# Create startup script
RUN echo '#!/bin/sh\n\
  # Start MORK server (listens on localhost:8000)\n\
  mork_server &\n\
  MORK_PID=$$\n\
  # Wait for MORK to be ready\n\
  while ! curl -s http://localhost:8000 >/dev/null; do sleep 1; done\n\
  # Start Next.js app\n\
  cd /app && pnpm start\n\
  # Cleanup if needed\n\
  wait $MORK_PID' > /start.sh && \
  chmod +x /start.sh

WORKDIR /app

# Only expose Next.js port (3000)
EXPOSE 3000

# Health check for Next.js
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["/start.sh"]


