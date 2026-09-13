SHELL := /bin/bash

COMPOSE ?= docker compose

.PHONY: start stop status logs build backend frontend

start:
	$(COMPOSE) up --build -d

stop:
	$(COMPOSE) down

status:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

build:
	$(COMPOSE) build

backend:
	$(COMPOSE) up backend

frontend:
	$(COMPOSE) up frontend
