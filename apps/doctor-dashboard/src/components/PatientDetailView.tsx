/**
 * Patient Detail View - shows full triage context for a single patient.
 * Includes agent execution timeline, structured intake, urgency assessment, and summary.
 */

import type { PatientRecord } from '../types';
import UrgencyBadge from './UrgencyBadge';
import { formatDateTime } from '../utils';

interface Props {
  patient: PatientRecord;
  onBack: () => void;
}

export default function PatientDetailView({ patient, onBack }: Props) {
  const urgency = patient.guardrailResult?.finalUrgencyLevel || 'Low';
  const patientName = patient.basicInfo?.name || 'Anonymous Patient';
  const age = patient.basicInfo?.age;
  const entryCategory = patient.entryCategory || 'General';

  return (
    <div className="flex-1 bg-gray-50">
      {/* Back button */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to patient list</span>
        </button>
      </div>

      {/* Patient Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Patient Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patientName}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                {age && (
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Age {age}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {entryCategory}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDateTime(patient.createdAt)}
                </div>
              </div>
            </div>
          </div>
          <UrgencyBadge level={urgency} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="space-y-6">
          {/* Agent Execution Timeline */}
          <AgentTimelineSection agentStates={patient.agentStates} />

          {/* Structured Intake Output */}
          <StructuredIntakeSection patient={patient} />

          {/* Urgency Assessment */}
          <UrgencyAssessmentSection patient={patient} />

          {/* Clinician Summary */}
          <ClinicianSummarySection patient={patient} />

          {/* Vitals */}
          <VitalsSection patient={patient} />
        </div>
      </div>
    </div>
  );
}

/**
 * Agent Execution Timeline section
 */
function AgentTimelineSection({
  agentStates,
}: {
  agentStates: any[];
}) {
  if (!agentStates || agentStates.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Agent Execution Timeline
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Multi-agent orchestration showing state hand-offs between AI agents
      </p>

      <div className="space-y-3">
        {agentStates.map((state, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Check icon */}
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Agent info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{state.agent}</span>
                <span className="text-sm text-gray-500">{formatDateTime(state.timestamp)}</span>
              </div>
              <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {state.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Structured Intake section
 */
function StructuredIntakeSection({ patient }: { patient: PatientRecord }) {
  const intake = patient.structuredIntake;

  if (!intake) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Structured Intake Output
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Generated by Intake Structuring Agent
      </p>

      <div className="space-y-4">
        {/* Primary Symptoms */}
        {intake.primarySymptoms && intake.primarySymptoms.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Primary Symptoms
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {intake.primarySymptoms.map((symptom, i) => (
                <li key={i} className="text-gray-700">{symptom}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Duration */}
        {intake.duration && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Symptom Duration
            </h3>
            <p className="text-gray-700">{intake.duration}</p>
          </div>
        )}

        {/* Red Flags (if any from structured data) */}
        {patient.clinicianSummary?.redFlags && patient.clinicianSummary.redFlags.length > 0 && (
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Red Flags
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {patient.clinicianSummary.redFlags.map((flag, i) => (
                <li key={i} className="text-red-700">{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Structured Summary */}
        {patient.symptomExplanation && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Structured Summary
            </h3>
            <p className="text-gray-700">{patient.symptomExplanation}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Urgency Assessment section
 */
function UrgencyAssessmentSection({ patient }: { patient: PatientRecord }) {
  const urgencyClassification = patient.urgencyClassification;
  const guardrailResult = patient.guardrailResult;

  if (!urgencyClassification && !guardrailResult) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Urgency Assessment
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Urgency proposed by AI, constrained by safety rules
      </p>

      <div className="space-y-4">
        {/* Final Urgency Level */}
        {guardrailResult && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Final Urgency Level
            </h3>
            <UrgencyBadge level={guardrailResult.finalUrgencyLevel} size="lg" />
          </div>
        )}

        {/* Confidence Score */}
        {urgencyClassification && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Confidence Score
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(urgencyClassification.confidence * 100)}%
            </p>
          </div>
        )}

        {/* Rationale */}
        {urgencyClassification?.reasoning && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rationale
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {urgencyClassification.reasoning.split('\n').filter(Boolean).map((line, i) => (
                <li key={i} className="text-gray-700">{line.replace(/^[•\-]\s*/, '')}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Applied Safety Guardrails */}
        {guardrailResult && guardrailResult.wasEscalated && (
          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-yellow-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Applied Safety Guardrails
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {guardrailResult.escalationReasons?.map((reason, i) => (
                <li key={i} className="text-yellow-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Clinician Summary section
 */
function ClinicianSummarySection({ patient }: { patient: PatientRecord }) {
  const summary = patient.clinicianSummary;

  if (!summary) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Clinician Summary
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        For clinician review — not diagnostic
      </p>

      <div className="space-y-4">
        {/* Report */}
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Report
          </h3>
          <p className="whitespace-pre-wrap text-gray-700">{summary.summary}</p>
        </div>

        {/* Suggested Next Steps */}
        {summary.suggestedActions && summary.suggestedActions.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Suggested Next Steps (Review Only)
            </h3>
            <ol className="list-decimal space-y-1 pl-5">
              {summary.suggestedActions.map((action, i) => (
                <li key={i} className="text-gray-700">{action}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Vitals section
 */
function VitalsSection({ patient }: { patient: PatientRecord }) {
  const vitals = patient.vitals;

  if (!vitals) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Vitals
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vitals.heartRate && (
          <VitalCard
            icon={
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            }
            label="Heart Rate"
            value={`${vitals.heartRate} bpm`}
            dataConfidence="HIGH"
          />
        )}
        {vitals.bloodPressure && (
          <VitalCard
            icon={<span className="text-xl">🩺</span>}
            label="Blood Pressure"
            value={vitals.bloodPressure}
            dataConfidence="HIGH"
          />
        )}
        {vitals.temperature && (
          <VitalCard
            icon={<span className="text-xl">🌡️</span>}
            label="Temperature"
            value={`${vitals.temperature}°F`}
            dataConfidence="HIGH"
          />
        )}
        {vitals.oxygenSaturation && (
          <VitalCard
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            }
            label="Respiration"
            value={`${vitals.oxygenSaturation} /min`}
            dataConfidence="HIGH"
          />
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Data confidence: <span className="font-medium text-green-600">HIGH</span>
      </div>
    </section>
  );
}

function VitalCard({
  icon,
  label,
  value,
  dataConfidence,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dataConfidence: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
