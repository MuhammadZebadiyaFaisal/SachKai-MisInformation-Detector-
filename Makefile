SHELL := /bin/bash

export PATH := /Applications/Docker.app/Contents/Resources/bin:$(PATH)

DOCKER ?= $(shell command -v docker 2>/dev/null || printf '%s' '/Applications/Docker.app/Contents/Resources/bin/docker')
COMPOSE ?= $(DOCKER) compose

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
