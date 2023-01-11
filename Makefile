dev:
	docker-compose -f docker-compose.dev.yml up --attach server --attach client

dev-build:
	docker-compose -f docker-compose.dev.yml up --build --attach server --attach client