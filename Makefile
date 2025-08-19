ps:
	docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

up:
	docker compose down
	docker compose up --build -d
	docker image prune -f