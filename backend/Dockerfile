# GetHire Backend — Dockerfile
# =============================
# Multi-stage build:
#   Stage 1 (builder): Install Python dependencies into a venv
#   Stage 2 (runtime): Copy only the venv + source — no build tools in the final image
#
# Development hot-reload is handled by docker-compose.yml via a volume mount
# that overrides the copied source, so --reload works without rebuilding.

# ── Stage 1: Dependency builder ────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies for native packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create an isolated virtual environment in /build/venv
RUN python -m venv /build/venv

# Upgrade pip inside the venv
RUN /build/venv/bin/pip install --upgrade pip

# Copy only requirements first — leverages Docker layer cache.
# The venv layer is only rebuilt when requirements.txt changes.
COPY requirements.txt .
RUN /build/venv/bin/pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Runtime image ─────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Non-root user for security
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy the pre-built virtual environment from builder stage
COPY --from=builder /build/venv /app/venv

# Copy application source
COPY --chown=appuser:appgroup . .

# Make the venv the active Python environment
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Switch to non-root user
USER appuser

EXPOSE 8000

# Health check — Docker will poll this; compose depends_on: condition: service_healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

# Development command (docker-compose overrides CMD for production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
