/**
 * LangGraph-based multi-agent orchestration pipeline for TriageAI.
 *
 * Agents run sequentially:
 *   1. Intake Structuring Agent – parses raw intake into structured fields
 *   2. Urgency Classification Agent – assigns urgency level based on structured data
 *   3. Clinician Summary Agent – generates a concise summary for clinicians
 *
 * Each agent reads from shared state and appends its output.
 * State is mutable and passed through the graph.
 */

import { StateGraph, END } from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';

// ─────────────────────────────────────────────────────────────
// Shared Pipeline State
// ─────────────────────────────────────────────────────────────

export interface TriageState {
  // Raw input from patient intake
  rawIntake: string;

  // Output from Intake Structuring Agent
  structuredIntake?: {
    chiefComplaint?: string;
    symptoms?: string[];
    duration?: string;
    additionalNotes?: string;
  };

  // Output from Urgency Classification Agent
  urgency?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    reasoning?: string;
  };

  // Output from Clinician Summary Agent
  clinicianSummary?: string;

  // Metadata / timestamps per agent
  agentTimestamps: {
    intakeStructuringCompletedAt?: string;
    urgencyClassificationCompletedAt?: string;
    clinicianSummaryCompletedAt?: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Node: Intake Structuring
// ─────────────────────────────────────────────────────────────

/**
 * Intake Structuring Agent
 *
 * Reads: state.rawIntake
 * Writes: state.structuredIntake, state.agentTimestamps.intakeStructuringCompletedAt
 *
 * This agent parses unstructured patient intake (speech/text) into
 * structured fields for downstream processing.
 */
async function intakeStructuringAgent(
  state: TriageState,
  _config?: RunnableConfig
): Promise<Partial<TriageState>> {
  // TODO: Replace with actual LLM call
  // const llmResponse = await llm.invoke(intakeStructuringPrompt, state.rawIntake);

  const structuredIntake = {
    chiefComplaint: '/* LLM_STUB: extract chief complaint */',
    symptoms: ['/* LLM_STUB: extract symptoms */'],
    duration: '/* LLM_STUB: extract duration */',
    additionalNotes: '/* LLM_STUB: extract additional notes */',
  };

  return {
    structuredIntake,
    agentTimestamps: {
      ...state.agentTimestamps,
      intakeStructuringCompletedAt: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Node: Urgency Classification
// ─────────────────────────────────────────────────────────────

/**
 * Urgency Classification Agent
 *
 * Reads: state.structuredIntake
 * Writes: state.urgency, state.agentTimestamps.urgencyClassificationCompletedAt
 *
 * This agent assigns an urgency level based on the structured intake.
 * NOTE: This is decision-support only, not a medical diagnosis.
 */
async function urgencyClassificationAgent(
  state: TriageState,
  _config?: RunnableConfig
): Promise<Partial<TriageState>> {
  // TODO: Replace with actual LLM call
  // const llmResponse = await llm.invoke(urgencyClassificationPrompt, state.structuredIntake);

  const urgency = {
    level: 'medium' as const, // LLM_STUB: determine urgency level
    reasoning: '/* LLM_STUB: explain urgency reasoning */',
  };

  return {
    urgency,
    agentTimestamps: {
      ...state.agentTimestamps,
      urgencyClassificationCompletedAt: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Node: Clinician Summary
// ─────────────────────────────────────────────────────────────

/**
 * Clinician Summary Agent
 *
 * Reads: state.structuredIntake, state.urgency
 * Writes: state.clinicianSummary, state.agentTimestamps.clinicianSummaryCompletedAt
 *
 * This agent generates a concise summary for clinicians,
 * combining structured intake and urgency classification.
 */
async function clinicianSummaryAgent(
  state: TriageState,
  _config?: RunnableConfig
): Promise<Partial<TriageState>> {
  // TODO: Replace with actual LLM call
  // const llmResponse = await llm.invoke(clinicianSummaryPrompt, {
  //   structuredIntake: state.structuredIntake,
  //   urgency: state.urgency,
  // });

  const clinicianSummary = '/* LLM_STUB: generate clinician summary */';

  return {
    clinicianSummary,
    agentTimestamps: {
      ...state.agentTimestamps,
      clinicianSummaryCompletedAt: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Graph Construction
// ─────────────────────────────────────────────────────────────

/**
 * Build the triage pipeline graph.
 *
 * Flow:
 *   START → intakeStructuring → urgencyClassification → clinicianSummary → END
 *
 * State is merged at each step (partial updates).
 */
export function buildTriageGraph() {
  const graph = new StateGraph<TriageState>({
    channels: {
      rawIntake: { value: (a: string, b?: string) => b ?? a },
      structuredIntake: { value: (a, b) => b ?? a },
      urgency: { value: (a, b) => b ?? a },
      clinicianSummary: { value: (a: string, b?: string) => b ?? a },
      agentTimestamps: { value: (a, b) => ({ ...a, ...b }) },
    },
  });

  // Add nodes
  graph.addNode('intakeStructuring', intakeStructuringAgent);
  graph.addNode('urgencyClassification', urgencyClassificationAgent);
  graph.addNode('clinicianSummary', clinicianSummaryAgent);

  // Define edges (sequential flow)
  graph.setEntryPoint('intakeStructuring');
  graph.addEdge('intakeStructuring', 'urgencyClassification');
  graph.addEdge('urgencyClassification', 'clinicianSummary');
  graph.addEdge('clinicianSummary', END);

  return graph.compile();
}

// ─────────────────────────────────────────────────────────────
// Pipeline Execution Helper
// ─────────────────────────────────────────────────────────────

/**
 * Run the triage pipeline with raw intake text.
 *
 * @param rawIntake - Unstructured patient intake (speech transcript or text)
 * @returns Final state with all agent outputs
 */
export async function runTriagePipeline(rawIntake: string): Promise<TriageState> {
  const graph = buildTriageGraph();

  const initialState: TriageState = {
    rawIntake,
    agentTimestamps: {},
  };

  // Invoke the graph; state is updated as each agent completes
  const finalState = await graph.invoke(initialState);

  return finalState as TriageState;
}
