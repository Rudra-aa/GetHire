# GetHire — Developer Makefile
# ==============================
# Shortcuts for common development commands.
# Run `make help` to see all available commands.
#
# Usage:
#   make dev          Start all Docker services
#   make down         Stop all Docker services
#   make test         Run all tests
#   make lint         Run all linters

.PHONY: help dev down build logs test lint format clean db-shell redis-shell

# ── Colours ────────────────────────────────────────────────────────────────
BOLD  := \033[1m
RESET := \033[0m
GREEN := \033[32m
CYAN  := \033[36m

# ── Default target ─────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "$(BOLD)GetHire — Developer Commands$(RESET)"
	@echo ""
	@echo "$(BOLD)Docker$(RESET)"
	@echo "  $(CYAN)make dev$(RESET)              Start all services with hot reload"
	@echo "  $(CYAN)make dev-build$(RESET)        Rebuild images and start services"
	@echo "  $(CYAN)make down$(RESET)             Stop all services"
	@echo "  $(CYAN)make down-v$(RESET)           Stop services and delete volumes (⚠️  deletes data)"
	@echo "  $(CYAN)make logs$(RESET)             Follow logs from all services"
	@echo "  $(CYAN)make logs-backend$(RESET)     Follow backend logs only"
	@echo "  $(CYAN)make logs-frontend$(RESET)    Follow frontend logs only"
	@echo "  $(CYAN)make ps$(RESET)               Show running containers"
	@echo ""
	@echo "$(BOLD)Testing$(RESET)"
	@echo "  $(CYAN)make test$(RESET)             Run all backend tests"
	@echo "  $(CYAN)make test-v$(RESET)           Run backend tests (verbose)"
	@echo "  $(CYAN)make test-cov$(RESET)         Run tests with coverage report"
	@echo ""
	@echo "$(BOLD)Code Quality$(RESET)"
	@echo "  $(CYAN)make lint$(RESET)             Run ruff + mypy (backend)"
	@echo "  $(CYAN)make format$(RESET)           Format with black (backend) + prettier (frontend)"
	@echo "  $(CYAN)make format-check$(RESET)     Check formatting without modifying"
	@echo ""
	@echo "$(BOLD)Database$(RESET)"
	@echo "  $(CYAN)make db-shell$(RESET)         Open mongosh in the MongoDB container"
	@echo "  $(CYAN)make redis-shell$(RESET)      Open redis-cli in the Redis container"
	@echo ""
	@echo "$(BOLD)Utilities$(RESET)"
	@echo "  $(CYAN)make clean$(RESET)            Remove build artefacts and caches"
	@echo "  $(CYAN)make env$(RESET)              Copy .env.example to .env (if .env missing)"
	@echo ""

# ── Docker ─────────────────────────────────────────────────────────────────
dev:
	docker compose up

dev-build:
	docker compose up --build

down:
	docker compose down

down-v:
	@echo "$(BOLD)⚠️  This will delete all MongoDB and Redis data. Continue? [y/N]$(RESET)"
	@read ans && [ $${ans:-N} = y ]
	docker compose down -v

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

ps:
	docker compose ps

# ── Testing ────────────────────────────────────────────────────────────────
test:
	cd backend && python -m pytest tests/ -q

test-v:
	cd backend && python -m pytest tests/ -v

test-cov:
	cd backend && python -m pytest tests/ --cov=app --cov-report=term-missing --cov-report=html
	@echo "$(GREEN)Coverage report: backend/htmlcov/index.html$(RESET)"

# ── Code Quality ───────────────────────────────────────────────────────────
lint:
	cd backend && ruff check app/ tests/
	cd backend && mypy app/

lint-fix:
	cd backend && ruff check --fix app/ tests/

format:
	cd backend && black app/ tests/
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css,json}"

format-check:
	cd backend && black --check app/ tests/
	cd frontend && npx prettier --check "src/**/*.{ts,tsx,css,json}"

# ── Database ───────────────────────────────────────────────────────────────
db-shell:
	docker compose exec mongo mongosh gethire

redis-shell:
	docker compose exec redis redis-cli

# ── Utilities ──────────────────────────────────────────────────────────────
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".coverage" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Cleaned build artefacts$(RESET)"

env:
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "$(GREEN)✓ Created .env from env.example$(RESET)"; \
		echo "$(BOLD)Edit .env and set SECRET_KEY before running in production.$(RESET)"; \
	else \
		echo ".env already exists — not overwriting."; \
	fi
