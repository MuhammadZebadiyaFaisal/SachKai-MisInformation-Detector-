SHELL := /bin/bash

BACKEND_HOST ?= 127.0.0.1
BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 3000

RUN_DIR := .run
BACKEND_PID := $(RUN_DIR)/backend.pid
FRONTEND_PID := $(RUN_DIR)/frontend.pid
BACKEND_LOG := $(RUN_DIR)/backend.log
FRONTEND_LOG := $(RUN_DIR)/frontend.log

.PHONY: start stop status backend frontend

start:
	@mkdir -p $(RUN_DIR)
	@if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat $(BACKEND_PID))" 2>/dev/null; then \
		echo "Backend already running on http://$(BACKEND_HOST):$(BACKEND_PORT)"; \
	else \
		echo "Starting backend on http://$(BACKEND_HOST):$(BACKEND_PORT)"; \
		nohup .venv/bin/uvicorn main:app --reload --host $(BACKEND_HOST) --port $(BACKEND_PORT) > "$(BACKEND_LOG)" 2>&1 & echo $$! > "$(BACKEND_PID)"; \
	fi
	@if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat $(FRONTEND_PID))" 2>/dev/null; then \
		echo "Frontend already running on http://localhost:$(FRONTEND_PORT)"; \
	else \
		echo "Starting frontend on http://localhost:$(FRONTEND_PORT)"; \
		nohup npm run dev -- --port $(FRONTEND_PORT) > "$(FRONTEND_LOG)" 2>&1 & echo $$! > "$(FRONTEND_PID)"; \
	fi
	@$(MAKE) status

stop:
	@if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat $(BACKEND_PID))" 2>/dev/null; then \
		echo "Stopping backend"; \
		kill "$$(cat $(BACKEND_PID))"; \
	else \
		echo "Backend is not running"; \
	fi
	@if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat $(FRONTEND_PID))" 2>/dev/null; then \
		echo "Stopping frontend"; \
		kill "$$(cat $(FRONTEND_PID))"; \
	else \
		echo "Frontend is not running"; \
	fi
	@rm -f "$(BACKEND_PID)" "$(FRONTEND_PID)"

status:
	@if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat $(BACKEND_PID))" 2>/dev/null; then \
		echo "Backend: running at http://$(BACKEND_HOST):$(BACKEND_PORT) (pid $$(cat $(BACKEND_PID)))"; \
	else \
		echo "Backend: stopped"; \
	fi
	@if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat $(FRONTEND_PID))" 2>/dev/null; then \
		echo "Frontend: running at http://localhost:$(FRONTEND_PORT) (pid $$(cat $(FRONTEND_PID)))"; \
	else \
		echo "Frontend: stopped"; \
	fi
	@echo "Logs: $(BACKEND_LOG), $(FRONTEND_LOG)"

backend:
	.venv/bin/uvicorn main:app --reload --host $(BACKEND_HOST) --port $(BACKEND_PORT)

frontend:
	npm run dev -- --port $(FRONTEND_PORT)
