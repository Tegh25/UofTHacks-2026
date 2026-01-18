/**
 * Type definitions for the doctor dashboard.
 * These mirror the shared patient schema with agent outputs.
 */

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type AgentStatus = 'pending' | 'in_progress' | 'completed' | 'error';

/**
 * Agent state entry tracking each agent's execution.
 */
export interface AgentStateEntry {
  agentRole: string;
  status: AgentStatus;
  output?: Record<string, unknown>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Structured intake output from the Intake Structuring Agent.
 */
export interface StructuredIntake {
  primarySymptoms: string[];
  symptomDuration: string | null;
  redFlags: string[];
  structuredSummary: string;
}

/**
 * Urgency classification from the Urgency Classification Agent.
 */
export interface UrgencyClassification {
  urgencyLevel: UrgencyLevel;
  confidence: number;
  rationale: string[];
}

/**
 * Final urgency after guardrails are applied.
 */
export interface GuardrailResult {
  finalUrgencyLevel: UrgencyLevel;
  appliedGuardrails: string[];
}

/**
 * Clinician summary from the Clinician Summary Agent.
 */
export interface ClinicianSummary {
  clinicianReport: string;
  suggestedNextSteps: string[];
  flags: string[];
}

/**
 * Patient vitals data.
 */
export interface Vitals {
  heartRate: number | null;
  respirationRate: number | null;
  captured: boolean;
  confidence?: number;
}

/**
 * Basic patient demographics.
 */
export interface BasicInfo {
  name: string;
  age: number | null;
  sexAtBirth: string | null;
  preferredLanguage: string;
}

/**
 * Full patient record as returned from the API.
 */
export interface PatientRecord {
  _id: string;
  id?: string;
  entryCategory: string | null;
  symptomExplanation: string;
  vitals: Vitals;
  basicInfo: BasicInfo;
  preExistingConditions: string[];
  createdAt: string;
  updatedAt: string;

  // Agent outputs (may be undefined if agents haven't run yet)
  structuredIntake?: StructuredIntake;
  urgencyClassification?: UrgencyClassification;
  guardrailResult?: GuardrailResult;
  clinicianSummary?: ClinicianSummary;
  agentStates?: AgentStateEntry[];
}
