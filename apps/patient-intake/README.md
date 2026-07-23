# Patient Intake App

Patient-facing React kiosk app for TriageAI.

7-step flow: reason for visit → symptom description (type or mock voice) →
passive vitals (mocked, always skippable) → basic info (with AI autofill
suggestions) → pre-existing conditions → review → submit.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

Expects the backend API at `http://localhost:3001`.
