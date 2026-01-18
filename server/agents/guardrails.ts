/**
 * Deterministic guardrails for triage urgency classification.
 * No AI/LLM usage.
 */

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface UrgencyAgentOutput {
  urgencyLevel: UrgencyLevel;
  confidence: number;
  rationale: string[];
}

export interface StructuredIntake {
  primarySymptoms: string[];
  redFlags: string[];
}

export interface Demographics {
  age: number | null;
}

export interface Vitals {
  heartRate?: number;
  respirationRate?: number;
  confidence?: number;
  available?: boolean;
}

export interface GuardrailResult {
  finalUrgencyLevel: UrgencyLevel;
  appliedGuardrails: string[];
}

const urgencyRank: Record<UrgencyLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

function maxUrgency(current: UrgencyLevel, minimum: UrgencyLevel): UrgencyLevel {
  return urgencyRank[minimum] > urgencyRank[current] ? minimum : current;
}

function hasRedFlags(structuredIntake: StructuredIntake): boolean {
  return Array.isArray(structuredIntake.redFlags) && structuredIntake.redFlags.length > 0;
}

/**
 * Apply guardrails to agent urgency output.
 * Guardrails may only escalate, never downgrade.
 */
export function applyUrgencyGuardrails(
  urgencyAgentOutput: UrgencyAgentOutput,
  structuredIntake: StructuredIntake,
  demographics: Demographics,
  vitals: Vitals
): GuardrailResult {
  const appliedGuardrails: string[] = [];
  let finalUrgencyLevel: UrgencyLevel = urgencyAgentOutput.urgencyLevel;

  // 1) Low confidence → flag only, no downgrade
  if (urgencyAgentOutput.confidence < 0.6) {
    appliedGuardrails.push('Low confidence — clinician review recommended');
  }

  // 2) Age < 5 or age > 65 → minimum Medium
  if (typeof demographics.age === 'number') {
    if (demographics.age < 5 || demographics.age > 65) {
      finalUrgencyLevel = maxUrgency(finalUrgencyLevel, 'Medium');
      appliedGuardrails.push('Age-based escalation to at least Medium');
    }
  }

  // 3) Age > 75 AND red flags → minimum High
  if (typeof demographics.age === 'number') {
    if (demographics.age > 75 && hasRedFlags(structuredIntake)) {
      finalUrgencyLevel = maxUrgency(finalUrgencyLevel, 'High');
      appliedGuardrails.push('Age > 75 with red flags → at least High');
    }
  }

  // 4) Any red flag → minimum High
  if (hasRedFlags(structuredIntake)) {
    finalUrgencyLevel = maxUrgency(finalUrgencyLevel, 'High');
    appliedGuardrails.push('Red flag symptom present → at least High');
  }

  // 5) Elevated vitals → minimum High
  const heartRate = vitals.heartRate;
  const respirationRate = vitals.respirationRate;
  if ((typeof heartRate === 'number' && heartRate > 110) ||
      (typeof respirationRate === 'number' && respirationRate > 22)) {
    finalUrgencyLevel = maxUrgency(finalUrgencyLevel, 'High');
    appliedGuardrails.push('Elevated vitals → at least High');
  }

  return {
    finalUrgencyLevel,
    appliedGuardrails,
  };
}
