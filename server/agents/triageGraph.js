/**
 * LangGraph-based multi-agent orchestration pipeline for TriageAI.
 *
 * Agents run sequentially:
 *   1. Intake Structuring Agent – parses raw intake into structured fields
 *   2. Urgency Classification Agent – assigns urgency level (decision support only)
 *   3. Guardrail Step – deterministic safety rules (NO AI, may only escalate)
 *   4. Clinician Summary Agent – generates a concise summary for clinicians
 *
 * MongoDB is the single source of truth: each node persists its output and
 * status transitions (pending → in_progress → completed) as it runs, so the
 * dashboard can watch state evolve in near real-time.
 *
 * Every LLM-backed agent has a deterministic fallback so the pipeline always
 * completes, even if the AI service is unavailable.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { updatePatientRecord, getPatientById } from '../db/mongo.js';
import { callAgentLLM, isLLMConfigured } from './llm.js';
import {
  intakeStructuringPrompt,
  urgencyClassificationPrompt,
  clinicianSummaryPrompt,
} from './prompts.js';
import { applyUrgencyGuardrails } from './guardrails.js';

// ─────────────────────────────────────────────────────────────
// Agent roles (persisted in each patient's agentStates array)
// ─────────────────────────────────────────────────────────────

export const AGENT_ROLES = [
  'intakeStructuring',
  'urgencyClassification',
  'guardrails',
  'clinicianSummary',
];

/**
 * Initial agentStates entries for a newly created patient record.
 */
export function initialAgentStates() {
  return AGENT_ROLES.map((agentRole) => ({
    agentRole,
    status: 'pending',
  }));
}

// Simulated per-agent processing delay so judges can watch state evolve.
const AGENT_DELAY_MS = 1500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────────────────────

/**
 * Update one agent's entry in the patient's agentStates array and persist
 * it (plus any extra top-level fields) to MongoDB.
 */
async function persistAgentState(state, agentRole, patch, extraFields = {}) {
  const agentStates = state.agentStates.map((entry) =>
    entry.agentRole === agentRole ? { ...entry, ...patch } : entry
  );
  await updatePatientRecord(state.patientId, { agentStates, ...extraFields });
  return agentStates;
}

/**
 * Wrap an LLM call with a deterministic fallback.
 * Returns { output, via } where via records how the output was produced.
 */
async function callWithFallback(systemPrompt, userContent, fallbackFn) {
  if (isLLMConfigured()) {
    try {
      const output = await callAgentLLM(systemPrompt, userContent);
      return { output, via: 'backboard-llm' };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('LLM call failed, using deterministic fallback:', error.message);
    }
  }
  return { output: fallbackFn(), via: 'deterministic-fallback' };
}

// ─────────────────────────────────────────────────────────────
// Deterministic fallbacks (used when the LLM is unavailable)
// ─────────────────────────────────────────────────────────────

const RED_FLAG_KEYWORDS = [
  'chest pain',
  'chest pressure',
  'shortness of breath',
  "can't breathe",
  'cannot breathe',
  'difficulty breathing',
  'severe bleeding',
  'bleeding heavily',
  'unconscious',
  'passed out',
  'loss of consciousness',
  'fainted',
  'stroke',
  'slurred speech',
  'face drooping',
  'numbness on one side',
  'anaphylaxis',
  'severe allergic',
  'suicidal',
];

const SYMPTOM_KEYWORDS = [
  'headache', 'dizziness', 'dizzy', 'nausea', 'vomiting', 'fever', 'cough',
  'chest pain', 'shortness of breath', 'bleeding', 'rash', 'swelling',
  'fatigue', 'weakness', 'abdominal pain', 'stomach pain', 'back pain',
  'sore throat', 'chills', 'numbness', 'injury', 'broken', 'sprain',
  'burn', 'cut', 'pain',
];

function fallbackStructuredIntake(state) {
  const text = state.symptomExplanation.toLowerCase();

  const redFlags = RED_FLAG_KEYWORDS.filter((kw) => text.includes(kw));
  const primarySymptoms = SYMPTOM_KEYWORDS.filter((kw) => text.includes(kw))
    // Drop generic "pain" if a more specific pain symptom matched
    .filter((kw, _i, all) => kw !== 'pain' || !all.some((other) => other !== 'pain' && other.includes('pain')));

  const durationMatch = state.symptomExplanation.match(
    /(?:(?:for|since|over)\s+(?:the\s+)?(?:past\s+|last\s+)?|(?:past|last)\s+)((?:(?:a|an|few|couple(?:\s+of)?|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+)?(?:minute|hour|day|week|month|year)s?|yesterday|today|this\s+morning|last\s+night)/i
  );

  return {
    primarySymptoms: primarySymptoms.length > 0 ? primarySymptoms : ['unspecified symptoms'],
    symptomDuration: durationMatch ? durationMatch[1].trim() : null,
    redFlags,
    structuredSummary: `Patient (category: ${state.entryCategory || 'unspecified'}) reports: ${state.symptomExplanation.slice(0, 300)}`,
  };
}

function fallbackUrgencyClassification(state) {
  const redFlags = state.structuredIntake?.redFlags || [];
  if (redFlags.length > 0) {
    return {
      urgencyLevel: 'High',
      confidence: 0.55,
      rationale: [
        `Potential red flag language detected: ${redFlags.join(', ')}`,
        'Automated keyword-based estimate — AI service unavailable',
      ],
    };
  }

  const category = state.entryCategory;
  const urgencyLevel = category === 'pain' || category === 'injured' ? 'Medium' : 'Low';
  return {
    urgencyLevel,
    confidence: 0.5,
    rationale: [
      `Estimate based on intake category "${category || 'unspecified'}" only`,
      'Automated keyword-based estimate — AI service unavailable',
    ],
  };
}

function fallbackClinicianSummary(state) {
  const intake = state.structuredIntake;
  const urgency = state.guardrailResult?.finalUrgencyLevel || state.urgencyClassification?.urgencyLevel;
  const conditions = state.preExistingConditions;

  const parts = [
    `Patient presenting via kiosk intake (category: ${state.entryCategory || 'unspecified'}).`,
    `Reported symptoms: ${intake?.primarySymptoms?.join(', ') || 'not structured'}.`,
    intake?.symptomDuration ? `Reported duration: ${intake.symptomDuration}.` : null,
    conditions?.length ? `Self-reported history: ${conditions.join(', ')}.` : 'No pre-existing conditions reported.',
    `Current triage urgency (post-guardrails): ${urgency || 'unavailable'}.`,
  ].filter(Boolean);

  return {
    clinicianReport: parts.join(' '),
    suggestedNextSteps: [
      'Recommended to verify reported symptoms directly with the patient',
      'Consider standard vitals measurement on arrival',
      'Review intake transcript for context not captured in structured fields',
    ],
    flags: ['Summary generated by deterministic fallback — AI service unavailable'],
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Nodes
// ─────────────────────────────────────────────────────────────

/**
 * Agent 1: Intake Structuring
 * Reads raw intake text; writes structuredIntake.
 */
async function structureIntakeNode(state) {
  let agentStates = await persistAgentState(state, 'intakeStructuring', {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
  await delay(AGENT_DELAY_MS);

  const userContent = JSON.stringify({
    intakeCategory: state.entryCategory,
    symptomDescription: state.symptomExplanation,
    demographics: state.basicInfo,
  });

  const { output, via } = await callWithFallback(
    intakeStructuringPrompt,
    userContent,
    () => fallbackStructuredIntake(state)
  );

  const structuredIntake = {
    primarySymptoms: Array.isArray(output.primarySymptoms) ? output.primarySymptoms : [],
    symptomDuration: output.symptomDuration ?? null,
    redFlags: Array.isArray(output.redFlags) ? output.redFlags : [],
    structuredSummary: output.structuredSummary || '',
  };

  agentStates = await persistAgentState(
    { ...state, agentStates },
    'intakeStructuring',
    {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: { ...structuredIntake, generatedVia: via },
    },
    { structuredIntake }
  );

  return { structuredIntake, agentStates };
}

/**
 * Agent 2: Urgency Classification
 * Reads structuredIntake + demographics + vitals; writes urgencyClassification.
 * Decision support only — never a diagnosis.
 */
async function classifyUrgencyNode(state) {
  let agentStates = await persistAgentState(state, 'urgencyClassification', {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
  await delay(AGENT_DELAY_MS);

  const userContent = JSON.stringify({
    structuredIntake: state.structuredIntake,
    age: state.basicInfo?.age ?? null,
    intakeCategory: state.entryCategory,
    vitals: state.vitals?.captured ? state.vitals : null,
  });

  const { output, via } = await callWithFallback(
    urgencyClassificationPrompt,
    userContent,
    () => fallbackUrgencyClassification(state)
  );

  const validLevels = ['Low', 'Medium', 'High', 'Critical'];
  const urgencyClassification = {
    urgencyLevel: validLevels.includes(output.urgencyLevel) ? output.urgencyLevel : 'Medium',
    confidence: typeof output.confidence === 'number' ? Math.min(Math.max(output.confidence, 0), 1) : 0.5,
    rationale: Array.isArray(output.rationale) ? output.rationale : [String(output.rationale || 'No rationale provided')],
  };

  agentStates = await persistAgentState(
    { ...state, agentStates },
    'urgencyClassification',
    {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: { ...urgencyClassification, generatedVia: via },
    },
    { urgencyClassification }
  );

  return { urgencyClassification, agentStates };
}

/**
 * Guardrail Step — deterministic, NO AI.
 * May escalate urgency based on safety rules; never downgrades.
 */
async function applyGuardrailsNode(state) {
  let agentStates = await persistAgentState(state, 'guardrails', {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
  await delay(AGENT_DELAY_MS / 2);

  const guardrailResult = applyUrgencyGuardrails(
    state.urgencyClassification,
    state.structuredIntake,
    { age: state.basicInfo?.age ?? null },
    state.vitals || {}
  );

  agentStates = await persistAgentState(
    { ...state, agentStates },
    'guardrails',
    {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: { ...guardrailResult, generatedVia: 'deterministic-rules' },
    },
    { guardrailResult }
  );

  return { guardrailResult, agentStates };
}

/**
 * Agent 3: Clinician Summary
 * Reads all prior state; writes clinicianSummary.
 */
async function summarizeForClinicianNode(state) {
  let agentStates = await persistAgentState(state, 'clinicianSummary', {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
  await delay(AGENT_DELAY_MS);

  const userContent = JSON.stringify({
    structuredIntake: state.structuredIntake,
    finalUrgency: state.guardrailResult?.finalUrgencyLevel,
    appliedGuardrails: state.guardrailResult?.appliedGuardrails,
    urgencyConfidence: state.urgencyClassification?.confidence,
    preExistingConditions: state.preExistingConditions,
    demographics: state.basicInfo,
    vitals: state.vitals?.captured ? state.vitals : null,
  });

  const { output, via } = await callWithFallback(
    clinicianSummaryPrompt,
    userContent,
    () => fallbackClinicianSummary(state)
  );

  const clinicianSummary = {
    clinicianReport: output.clinicianReport || '',
    suggestedNextSteps: Array.isArray(output.suggestedNextSteps) ? output.suggestedNextSteps : [],
    flags: Array.isArray(output.flags) ? output.flags : [],
  };

  agentStates = await persistAgentState(
    { ...state, agentStates },
    'clinicianSummary',
    {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: { ...clinicianSummary, generatedVia: via },
    },
    { clinicianSummary, triageStatus: 'completed' }
  );

  return { clinicianSummary, agentStates };
}

// ─────────────────────────────────────────────────────────────
// Graph Construction
// ─────────────────────────────────────────────────────────────

const lastWriteWins = { value: (a, b) => b ?? a, default: () => undefined };

/**
 * Build the triage pipeline graph.
 *
 * Flow:
 *   START → structureIntake → classifyUrgency → applyGuardrails → summarizeForClinician → END
 */
export function buildTriageGraph() {
  const graph = new StateGraph({
    channels: {
      patientId: lastWriteWins,
      entryCategory: lastWriteWins,
      symptomExplanation: lastWriteWins,
      basicInfo: lastWriteWins,
      preExistingConditions: lastWriteWins,
      vitals: lastWriteWins,
      agentStates: lastWriteWins,
      structuredIntake: lastWriteWins,
      urgencyClassification: lastWriteWins,
      guardrailResult: lastWriteWins,
      clinicianSummary: lastWriteWins,
    },
  });

  graph.addNode('structureIntake', structureIntakeNode);
  graph.addNode('classifyUrgency', classifyUrgencyNode);
  graph.addNode('applyGuardrails', applyGuardrailsNode);
  graph.addNode('summarizeForClinician', summarizeForClinicianNode);

  graph.setEntryPoint('structureIntake');
  graph.addEdge('structureIntake', 'classifyUrgency');
  graph.addEdge('classifyUrgency', 'applyGuardrails');
  graph.addEdge('applyGuardrails', 'summarizeForClinician');
  graph.addEdge('summarizeForClinician', END);

  return graph.compile();
}

// ─────────────────────────────────────────────────────────────
// Pipeline Execution
// ─────────────────────────────────────────────────────────────

/**
 * Run the triage pipeline for a freshly created patient record.
 * Each agent persists its own output; on unexpected failure the record is
 * marked so the dashboard can surface it instead of spinning forever.
 *
 * @param {object} patientRecord - Record returned by createPatientRecord()
 */
export async function runTriagePipeline(patientRecord) {
  const graph = buildTriageGraph();

  const initialState = {
    patientId: patientRecord.id,
    entryCategory: patientRecord.entryCategory ?? null,
    symptomExplanation: patientRecord.symptomExplanation ?? '',
    basicInfo: patientRecord.basicInfo ?? {},
    preExistingConditions: patientRecord.preExistingConditions ?? [],
    vitals: patientRecord.vitals ?? {},
    agentStates: patientRecord.agentStates ?? initialAgentStates(),
  };

  try {
    return await graph.invoke(initialState);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Triage pipeline failed for patient ${patientRecord.id}:`, error);
    // Mark any non-completed agents as errored so the dashboard doesn't show
    // a pipeline that spins forever.
    const current = await getPatientById(patientRecord.id);
    const agentStates = (current?.agentStates ?? initialState.agentStates).map((entry) =>
      entry.status === 'completed'
        ? entry
        : { ...entry, status: 'error', errorMessage: 'Pipeline failed unexpectedly' }
    );
    await updatePatientRecord(patientRecord.id, { triageStatus: 'error', agentStates });
    throw error;
  }
}
