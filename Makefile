.PHONY: bootstrap run-backend run-frontend test-backend dev-up embed-kb

bootstrap:
	./scripts/bootstrap.sh

run-backend:
	cd backend && uvicorn app.main:app --reload

run-frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && pytest -q

dev-up:
	cd infra && docker compose up --build

embed-kb:
	python3 scripts/embed_kb.py --path samples/kb --collection kb_main
