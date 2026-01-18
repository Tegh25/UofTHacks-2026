/**
 * Shared patient intake schema for TriageAI.
 * Used by patient-intake app, doctor-dashboard, and backend agents.
 *
 * NOTE: This schema does NOT include diagnoses or treatment recommendations.
 * All AI outputs are decision-support only.
 */

// ─────────────────────────────────────────────────────────────
// Raw Intake
// ─────────────────────────────────────────────────────────────

export type IntakeSource = 'speech' | 'text';

export interface RawIntake {
  source: IntakeSource;
  content: string;
  language?: string;
  capturedAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Demographics
// ─────────────────────────────────────────────────────────────

export interface Demographics {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 date
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// ─────────────────────────────────────────────────────────────
// Vitals (optional)
// ─────────────────────────────────────────────────────────────

export interface Vitals {
  heartRateBpm?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperatureCelsius?: number;
  respiratoryRate?: number;
  oxygenSaturationPercent?: number;
  recordedAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Multi-Agent State
// ─────────────────────────────────────────────────────────────

export type AgentRole =
  | 'intake'
  | 'transcription'
  | 'extraction'
  | 'triage'
  | 'summary'
  | 'router';

export interface AgentStateEntry {
  agentRole: AgentRole;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  output?: Record<string, unknown>; // agent-specific payload
  errorMessage?: string;
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Patient Intake Record (root document)
// ─────────────────────────────────────────────────────────────

export interface PatientIntakeRecord {
  id: string; // unique record ID (e.g., UUID or Mongo ObjectId)
  demographics: Demographics;
  rawIntake: RawIntake;
  vitals?: Vitals;
  agentStates: AgentStateEntry[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
