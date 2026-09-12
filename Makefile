SHELL := /bin/bash

BACKEND_HOST ?= 127.0.0.1
BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 3000
NGROK_DOMAIN ?= rigoberto-urceolate-ilda.ngrok-free.dev

RUN_DIR := .run
BACKEND_PID := $(RUN_DIR)/backend.pid
FRONTEND_PID := $(RUN_DIR)/frontend.pid
NGROK_PID := $(RUN_DIR)/ngrok.pid
BACKEND_LOG := $(RUN_DIR)/backend.log
FRONTEND_LOG := $(RUN_DIR)/frontend.log
NGROK_LOG := $(RUN_DIR)/ngrok.log

.PHONY: start stop status backend frontend tunnel

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
	@if [ -f "$(NGROK_PID)" ] && kill -0 "$$(cat $(NGROK_PID))" 2>/dev/null; then \
		echo "ngrok already running at https://$(NGROK_DOMAIN)"; \
	else \
		echo "Starting ngrok at https://$(NGROK_DOMAIN)"; \
		nohup ngrok http --domain=$(NGROK_DOMAIN) $(FRONTEND_PORT) > "$(NGROK_LOG)" 2>&1 & echo $$! > "$(NGROK_PID)"; \
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
	@if [ -f "$(NGROK_PID)" ] && kill -0 "$$(cat $(NGROK_PID))" 2>/dev/null; then \
		echo "Stopping ngrok"; \
		kill "$$(cat $(NGROK_PID))"; \
	else \
		echo "ngrok is not running"; \
	fi
	@rm -f "$(BACKEND_PID)" "$(FRONTEND_PID)" "$(NGROK_PID)"

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
	@if [ -f "$(NGROK_PID)" ] && kill -0 "$$(cat $(NGROK_PID))" 2>/dev/null; then \
		echo "ngrok: running at https://$(NGROK_DOMAIN) (pid $$(cat $(NGROK_PID)))"; \
	else \
		echo "ngrok: stopped"; \
	fi
	@echo "Public URL: https://$(NGROK_DOMAIN)"
	@echo "Logs: $(BACKEND_LOG), $(FRONTEND_LOG), $(NGROK_LOG)"

backend:
	.venv/bin/uvicorn main:app --reload --host $(BACKEND_HOST) --port $(BACKEND_PORT)

frontend:
	npm run dev -- --port $(FRONTEND_PORT)

tunnel:
	ngrok http --domain=$(NGROK_DOMAIN) $(FRONTEND_PORT)
