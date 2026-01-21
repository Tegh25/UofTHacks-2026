# UofTHacks-2026

## Inspiration

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


# Prompt Zero for Agent

You are helping build a hackathon demo project.

Constraints:
- This is a MONOREPO.
- Do NOT invent credentials, API keys, or secrets.
- Do NOT attempt to fully configure third-party SDKs.
- Stub or mock integrations where required.
- Use clean, readable, production-style code.
- Prioritize demo stability over completeness.

Project overview:
- Patient intake web app (React)
- Doctor dashboard web app (React)
- Backend API (Node.js)
- Multi-agent orchestration using LangGraph
- Shared MongoDB patient state

Do NOT generate medical diagnoses or treatment logic.
All AI output is decision-support only.
