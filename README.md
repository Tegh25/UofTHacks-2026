# UofTHacks-2026

## TriageAI

Emergency departments are often overwhelmed, and the first few minutes of intake can significantly impact patient outcomes. Today, triage relies heavily on manual questioning, language-dependent communication, and subjective interpretation—often under stressful conditions.

We were inspired by a simple question: **what if we could preserve a patient’s story, context, and urgency clearly and safely *before* a clinician ever sees them?**

TriageAI was built to explore how responsible AI, when designed with guardrails and clinicians in the loop, can improve accessibility, consistency, and safety in emergency care.

## What it does

**TriageAI** is an AI-assisted, clinician-in-the-loop triage system designed for emergency rooms and urgent care settings.

It consists of:
- A **patient-facing web intake kiosk** where patients describe their symptoms using speech or text
- An **AI-powered multi-agent pipeline** that structures intake, estimates urgency, and produces a clinician-ready summary
- A **doctor dashboard** that shows patients prioritized by urgency and clearly visualizes how AI agents contributed to each assessment

Key features:
- Multilingual-friendly intake via speech or text
- Passive, non-invasive vitals support (optional)
- Conservative urgency classification (Low / Medium / High / Critical)
- Deterministic safety guardrails that always err on the side of escalation
- Clear, explainable agent hand-offs and timestamps
- No diagnoses or treatment recommendations — decision support only

## How we built it

TriageAI was built as a **monorepo** with a clean separation of concerns:

- **Frontend**
  - React + TypeScript + Tailwind CSS
  - Patient Intake Web App (ER kiosk)
  - Doctor Dashboard Web App (clinician-facing)

- **Backend**
  - Node.js + Express API
  - MongoDB as a shared, evolving patient state store
  - Polling-based real-time updates for demo reliability

- **AI & Orchestration**
  - Multi-agent system orchestrated using **LangGraph**
  - Agents include:
    - Intake Structuring Agent
    - Urgency Classification Agent
    - Clinician Summary Agent
  - Deterministic **post-agent guardrails** enforce safety rules (age risk, red flags, vitals, uncertainty)
  - Adaptive memory and model selection supported via **Backboard.io + LangChain**

The MongoDB patient record acts as the shared “state,” allowing each agent to append its output in sequence, making orchestration and hand-offs fully inspectable.

## Challenges we ran into

- **Balancing safety with usefulness** in a healthcare context  
  We had to be extremely careful to avoid diagnoses, treatment advice, or overconfident AI outputs.

- **Making multi-agent orchestration visible**  
  It’s easy to claim “multi-agent AI”; it’s much harder to *show* it clearly. We solved this by explicitly exposing agent timelines, outputs, and timestamps in the dashboard.

- **Scope discipline as a solo hacker**  
  Many tempting features (real-time video analysis, mobile apps, advanced analytics) were intentionally cut to ensure a stable, polished demo.

## Accomplishments that we’re proud of

- Designing a **responsible AI system** for healthcare that prioritizes safety and explainability
- Building a **clear, inspectable multi-agent pipeline** that meets real-world standards
- Creating a clinician dashboard that makes AI behavior transparent rather than opaque
- Integrating deterministic guardrails that constrain AI outputs
- Completing an end-to-end system solo within a tight hackathon timeframe

## What we learned

- In high-stakes domains, **constraints are a feature, not a limitation**
- AI systems are far more trustworthy when paired with explicit rules and human oversight
- Clear state management and explainability matter more than model complexity
- Judges and users alike value **clarity, responsibility, and intent** over flashy demos

## What’s next for TriageAI

- A **home/mobile pre-triage experience** to help patients choose the right care setting before arriving
- Deeper multilingual support with omnilingual speech models
- Integration with EHR systems for seamless clinician workflows
- Longitudinal learning from clinician feedback to continuously improve triage consistency
- Further research into bias mitigation and accessibility in emergency care


# Running the Demo

## Prerequisites

- Node.js 20.6+ (uses `node --env-file`)
- A `.env` file in the repo root:

```env
mongodb_cluster_username=...
mongodb_cluster_password=...
backboard_api_key=...
```

> If MongoDB Atlas is unreachable (e.g. your IP isn't on the cluster's
> Network Access list), the server falls back to in-memory storage so the
> demo still works. If Backboard.io is unreachable, agents fall back to
> deterministic logic. Both fallbacks log a warning.

## Start all three services

```bash
# Terminal 1 — backend API (http://localhost:3001)
cd server && npm install && npm run dev

# Terminal 2 — patient intake kiosk (http://localhost:3000)
cd apps/patient-intake && npm install && npm run dev

# Terminal 3 — doctor dashboard (http://localhost:3002)
cd apps/doctor-dashboard && npm install && npm run dev
```

Optional: seed demo patients so the dashboard isn't empty:

```bash
cd server && npm run seed
```

## Demo script

1. Open the dashboard (`:3002`) on one screen and the kiosk (`:3000`) on another.
2. Complete an intake on the kiosk — try mentioning "chest pain" and an age
   over 65 to see red flags and guardrail escalations.
3. Watch the dashboard: the new patient appears within 5 seconds, and the
   detail view shows each agent going pending → running → completed live.
4. Review the final urgency, applied guardrails, and clinician summary.
5. Use "Clear Demo Data" in the dashboard nav to reset between runs.
