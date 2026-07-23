# Doctor Dashboard

Clinician-facing React app for TriageAI.

- Shows all patients sorted by urgency (Critical → Low, then oldest first)
- Auto-refreshes every 5 seconds (list and open detail view)
- Detail view shows the agent execution timeline, structured intake,
  urgency assessment with applied guardrails, clinician summary, and vitals
- Read-only except for the "Clear Demo Data" utility

## Run

```bash
npm install
npm run dev   # http://localhost:3002
```

Expects the backend API at `http://localhost:3001`.
