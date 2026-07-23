/**
 * Shared patient record schema for TriageAI.
 * Mirrors the MongoDB document produced by the intake kiosk and the
 * multi-agent pipeline, and consumed by the doctor dashboard.
 *
 * NOTE: This schema does NOT include diagnoses or treatment recommendations.
 * All AI outputs are decision-support only.
 */

// ─────────────────────────────────────────────────────────────
// Patient-Provided Data (from the intake kiosk)
// ─────────────────────────────────────────────────────────────

export type EntryCategory = 'pain' | 'unwell' | 'injured' | 'worried' | 'other';

export interface BasicInfo {
  name: string;
  age: number | null;
  sexAtBirth: 'male' | 'female' | 'other' | null;
  preferredLanguage: string;
}

export interface Vitals {
  heartRate: number | null;
  respirationRate: number | null;
  captured: boolean;
}

// ─────────────────────────────────────────────────────────────
// Agent Outputs
// ─────────────────────────────────────────────────────────────

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

/** Agent 1: Intake Structuring Agent */
export interface StructuredIntake {
  primarySymptoms: string[];
  symptomDuration: string | null;
  redFlags: string[];
  structuredSummary: string;
}

/** Agent 2: Urgency Classification Agent */
export interface UrgencyClassification {
  urgencyLevel: UrgencyLevel;
  confidence: number; // 0..1
  rationale: string[];
}

/** Deterministic guardrail step (no AI, escalate-only) */
export interface GuardrailResult {
  finalUrgencyLevel: UrgencyLevel;
  appliedGuardrails: string[];
}

/** Agent 3: Clinician Summary Agent */
export interface ClinicianSummary {
  clinicianReport: string;
  suggestedNextSteps: string[];
  flags: string[];
}

// ─────────────────────────────────────────────────────────────
// Multi-Agent Execution State
// ─────────────────────────────────────────────────────────────

export type AgentRole =
  | 'intakeStructuring'
  | 'urgencyClassification'
  | 'guardrails'
  | 'clinicianSummary';

export interface AgentStateEntry {
  agentRole: AgentRole;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  output?: Record<string, unknown>; // agent-specific payload
  errorMessage?: string;
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Patient Record (root document)
// ─────────────────────────────────────────────────────────────

export interface PatientIntakeRecord {
  id: string; // Mongo ObjectId as string
  entryCategory: EntryCategory | null;
  symptomExplanation: string;
  vitals: Vitals;
  basicInfo: BasicInfo;
  preExistingConditions: string[];

  // Written incrementally by the agent pipeline
  agentStates: AgentStateEntry[];
  structuredIntake?: StructuredIntake;
  urgencyClassification?: UrgencyClassification;
  guardrailResult?: GuardrailResult;
  clinicianSummary?: ClinicianSummary;
  triageStatus?: 'processing' | 'completed' | 'error';

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
