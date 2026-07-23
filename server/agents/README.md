# Agents

LangGraph multi-agent orchestration for TriageAI.

Sequential pipeline (`triageGraph.js`):

1. **Intake Structuring Agent** — raw patient words → `structuredIntake`
2. **Urgency Classification Agent** — → `urgencyClassification` (level, confidence, rationale)
3. **Guardrail Step** (`guardrails.js`) — deterministic rules, NO AI, escalate-only
4. **Clinician Summary Agent** — → `clinicianSummary` (report, next steps, flags)

Each node persists its status (pending → in_progress → completed) and output
to MongoDB as it runs, so the dashboard can watch state evolve.

LLM calls go through Backboard.io (`llm.js`) with safety-constrained JSON-only
prompts (`prompts.js`). Every agent has a deterministic fallback so the
pipeline always completes. No agent produces diagnoses or treatment advice.
