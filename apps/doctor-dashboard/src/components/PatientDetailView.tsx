/**
 * Patient Detail View - shows full triage context for a single patient.
 * Includes agent execution timeline, structured intake, urgency assessment,
 * guardrails, clinician summary, demographics, and vitals.
 */

import type { AgentStateEntry, PatientRecord } from '../types';
import UrgencyBadge from './UrgencyBadge';
import { formatDateTime } from '../utils';

interface Props {
  patient: PatientRecord;
  onBack: () => void;
}

const categoryLabels: Record<string, string> = {
  pain: 'In pain',
  unwell: 'Feeling unwell',
  injured: 'Injured',
  worried: 'Worried / something feels wrong',
  other: 'Other',
};

export default function PatientDetailView({ patient, onBack }: Props) {
  const urgency = patient.guardrailResult?.finalUrgencyLevel ?? 'Processing';
  const patientName = patient.basicInfo?.name || 'Anonymous Patient';
  const age = patient.basicInfo?.age;
  const entryCategory = patient.entryCategory
    ? categoryLabels[patient.entryCategory] ?? patient.entryCategory
    : 'General';

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
                {age != null && (
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
          {/* Responsible AI disclaimer */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-900">
              <strong>Decision support only.</strong> AI outputs on this page are not
              diagnoses and do not recommend treatment. All assessments require
              verification by clinical staff.
            </p>
          </div>

          <AgentTimelineSection agentStates={patient.agentStates} />
          <PatientOverviewSection patient={patient} />
          <StructuredIntakeSection patient={patient} />
          <UrgencyAssessmentSection patient={patient} />
          <ClinicianSummarySection patient={patient} />
          <VitalsSection patient={patient} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Agent Execution Timeline
// ─────────────────────────────────────────────────────────────

const agentLabels: Record<string, { name: string; description: string }> = {
  intakeStructuring: {
    name: 'Intake Structuring Agent',
    description: 'Parses the patient\u2019s words into structured fields',
  },
  urgencyClassification: {
    name: 'Urgency Classification Agent',
    description: 'Estimates urgency with confidence (decision support only)',
  },
  guardrails: {
    name: 'Safety Guardrails',
    description: 'Deterministic rules — no AI, may only escalate urgency',
  },
  clinicianSummary: {
    name: 'Clinician Summary Agent',
    description: 'Produces a concise, review-only report for staff',
  },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'Running',
  completed: 'Completed',
  error: 'Error',
};

function AgentStatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'in_progress') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
        <span className="h-3 w-3 animate-ping rounded-full bg-blue-500" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  // pending
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
      <span className="h-3 w-3 rounded-full border-2 border-gray-400" />
    </div>
  );
}

const statusBadgeClasses: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  error: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
};

function AgentTimelineSection({
  agentStates,
}: {
  agentStates?: AgentStateEntry[];
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

      <div className="space-y-4">
        {agentStates.map((state) => {
          const label = agentLabels[state.agentRole] ?? {
            name: state.agentRole,
            description: '',
          };
          return (
            <div key={state.agentRole} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AgentStatusIcon status={state.status} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{label.name}</span>
                  {state.completedAt && (
                    <span className="text-sm text-gray-500">
                      {formatDateTime(state.completedAt)}
                    </span>
                  )}
                </div>
                {label.description && (
                  <p className="text-sm text-gray-500">{label.description}</p>
                )}
                <span
                  className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    statusBadgeClasses[state.status] ?? statusBadgeClasses.pending
                  }`}
                >
                  {statusLabels[state.status] ?? state.status}
                </span>
                {state.errorMessage && (
                  <p className="mt-1 text-sm text-red-600">{state.errorMessage}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Patient Overview (demographics + raw intake)
// ─────────────────────────────────────────────────────────────

function PatientOverviewSection({ patient }: { patient: PatientRecord }) {
  const info = patient.basicInfo;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Patient Overview</h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">As reported by the patient at the kiosk</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewField label="Name" value={info?.name || 'Not provided'} />
        <OverviewField label="Age" value={info?.age != null ? String(info.age) : 'Not provided'} />
        <OverviewField label="Sex at birth" value={info?.sexAtBirth || 'Not provided'} />
        <OverviewField label="Preferred language" value={info?.preferredLanguage || 'Not provided'} />
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Pre-Existing Conditions (self-reported)
        </h3>
        {patient.preExistingConditions?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.preExistingConditions.map((c) => (
              <span key={c} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">None reported</p>
        )}
      </div>

      {patient.symptomExplanation && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            In Their Own Words
          </h3>
          <blockquote className="rounded-lg bg-gray-50 p-4 italic text-gray-700">
            “{patient.symptomExplanation}”
          </blockquote>
        </div>
      )}
    </section>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </h3>
      <p className="capitalize text-gray-900">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Structured Intake
// ─────────────────────────────────────────────────────────────

function StructuredIntakeSection({ patient }: { patient: PatientRecord }) {
  const intake = patient.structuredIntake;

  if (!intake) {
    return (
      <PendingSection
        title="Structured Intake Output"
        message="Waiting for the Intake Structuring Agent to finish..."
      />
    );
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
        {intake.symptomDuration && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Symptom Duration
            </h3>
            <p className="text-gray-700">{intake.symptomDuration}</p>
          </div>
        )}

        {/* Red Flags */}
        {intake.redFlags && intake.redFlags.length > 0 && (
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Red Flags
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {intake.redFlags.map((flag, i) => (
                <li key={i} className="text-red-700">{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Structured Summary */}
        {intake.structuredSummary && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Structured Summary
            </h3>
            <p className="text-gray-700">{intake.structuredSummary}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Urgency Assessment (agent output + guardrails)
// ─────────────────────────────────────────────────────────────

function UrgencyAssessmentSection({ patient }: { patient: PatientRecord }) {
  const urgencyClassification = patient.urgencyClassification;
  const guardrailResult = patient.guardrailResult;

  if (!urgencyClassification && !guardrailResult) {
    return (
      <PendingSection
        title="Urgency Assessment"
        message="Waiting for the Urgency Classification Agent to finish..."
      />
    );
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
        Urgency proposed by AI, constrained by deterministic safety rules
      </p>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* AI-proposed urgency */}
          {urgencyClassification && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                AI-Proposed Urgency
              </h3>
              <UrgencyBadge level={urgencyClassification.urgencyLevel} size="md" />
            </div>
          )}

          {/* Final Urgency Level */}
          {guardrailResult && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Final Urgency (Post-Guardrails)
              </h3>
              <UrgencyBadge level={guardrailResult.finalUrgencyLevel} size="lg" />
            </div>
          )}

          {/* Confidence Score */}
          {urgencyClassification && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Confidence
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(urgencyClassification.confidence * 100)}%
              </p>
              {urgencyClassification.confidence < 0.6 && (
                <p className="mt-1 text-sm font-medium text-yellow-700">
                  Low confidence — clinician review recommended
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rationale */}
        {urgencyClassification && urgencyClassification.rationale.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rationale
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {urgencyClassification.rationale.map((line, i) => (
                <li key={i} className="text-gray-700">{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Applied Safety Guardrails */}
        {guardrailResult && guardrailResult.appliedGuardrails.length > 0 && (
          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-yellow-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Applied Safety Guardrails (deterministic, escalate-only)
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {guardrailResult.appliedGuardrails.map((reason, i) => (
                <li key={i} className="text-yellow-800">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {guardrailResult && guardrailResult.appliedGuardrails.length === 0 && (
          <p className="text-sm text-gray-500">
            No safety guardrails were triggered for this patient.
          </p>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Clinician Summary
// ─────────────────────────────────────────────────────────────

function ClinicianSummarySection({ patient }: { patient: PatientRecord }) {
  const summary = patient.clinicianSummary;

  if (!summary) {
    return (
      <PendingSection
        title="Clinician Summary"
        message="Waiting for the Clinician Summary Agent to finish..."
      />
    );
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
          <p className="whitespace-pre-wrap text-gray-700">{summary.clinicianReport}</p>
        </div>

        {/* Suggested Next Steps */}
        {summary.suggestedNextSteps.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Suggested Next Steps (Review Only)
            </h3>
            <ol className="list-decimal space-y-1 pl-5">
              {summary.suggestedNextSteps.map((action, i) => (
                <li key={i} className="text-gray-700">{action}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Flags */}
        {summary.flags.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Flags
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {summary.flags.map((flag, i) => (
                <li key={i} className="text-gray-700">{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Vitals
// ─────────────────────────────────────────────────────────────

function VitalsSection({ patient }: { patient: PatientRecord }) {
  const vitals = patient.vitals;
  const captured = Boolean(vitals?.captured);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Passive Vitals
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Non-invasive kiosk estimates — clinical staff should take accurate measurements
      </p>

      {captured ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <VitalCard label="Heart Rate" value={`${vitals.heartRate} bpm`} />
          <VitalCard label="Respiratory Rate" value={`${vitals.respirationRate} /min`} />
        </div>
      ) : (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Vitals were not captured at the kiosk. This does not affect the
          patient's place in the queue.
        </p>
      )}
    </section>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-600">
        {label}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared placeholder for sections whose agent hasn't finished
// ─────────────────────────────────────────────────────────────

function PendingSection({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-2 text-gray-500">
        <span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
        <p className="text-sm">{message}</p>
      </div>
    </section>
  );
}
