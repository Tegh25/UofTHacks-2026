# Backend API

Node.js + Express API service for TriageAI.

## Endpoints

- `POST /intake` — create a patient record and start the triage pipeline
- `GET /patients` — list all patients
- `GET /patients/:id` — full patient record with agent outputs
- `POST /clear-demo-data` — delete all patient records (demo utility)
- `GET /health` — health check

## Run

```bash
npm install
npm run dev    # http://localhost:3001 (reads ../.env)
npm run seed   # insert demo patients
```

Requires `mongodb_cluster_username`, `mongodb_cluster_password`, and
`backboard_api_key` in the repo-root `.env`. If MongoDB Atlas is unreachable
(e.g. IP not whitelisted) the server falls back to in-memory storage so the
demo keeps working; if Backboard is unreachable, agents fall back to
deterministic logic.
