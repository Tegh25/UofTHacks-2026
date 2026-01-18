/**
 * Patient List View - shows all triaged patients.
 * Patients are sorted by urgency (Critical → Low) then by submission time.
 */

import type { PatientRecord, UrgencyLevel } from '../types';
import UrgencyBadge from './UrgencyBadge';
import { formatTimeAgo } from '../utils';

interface Props {
  patients: PatientRecord[];
  onSelectPatient: (id: string) => void;
  isLoading: boolean;
}

// Urgency sort order (lower = higher priority)
const urgencyOrder: Record<UrgencyLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function PatientListView({
  patients,
  onSelectPatient,
  isLoading,
}: Props) {
  // Sort patients by urgency then by submission time (oldest first within same urgency)
  const sortedPatients = [...patients].sort((a, b) => {
    const urgencyA = a.guardrailResult?.finalUrgencyLevel || 'Low';
    const urgencyB = b.guardrailResult?.finalUrgencyLevel || 'Low';

    // First sort by urgency
    const urgencyDiff = urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
    if (urgencyDiff !== 0) return urgencyDiff;

    // Then sort by time (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Calculate urgency breakdown
  const urgencyCounts = patients.reduce((acc, p) => {
    const level = p.guardrailResult?.finalUrgencyLevel || 'Low';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<UrgencyLevel, number>);

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">⏳</div>
          <p className="text-lg text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">📋</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            No Patients Yet
          </h2>
          <p className="text-gray-600">
            Patient intakes will appear here as they are submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Summary Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{patients.length} patients in queue</span>
          </div>
          <div className="flex items-center gap-3">
            {urgencyCounts.Critical > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                {urgencyCounts.Critical} Critical
              </span>
            )}
            {urgencyCounts.High > 0 && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                {urgencyCounts.High} High
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-8 py-6">
        <div className="space-y-3">
          {sortedPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onClick={() => onSelectPatient(patient._id)}
            />
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-auto border-t border-gray-200 bg-white px-8 py-4 text-center">
        <p className="text-sm text-gray-600">
          AI-assisted triage. All assessments require clinical verification.
        </p>
      </div>
    </div>
  );
}

/**
 * Individual patient card in the list.
 */
function PatientCard({
  patient,
  onClick,
}: {
  patient: PatientRecord;
  onClick: () => void;
}) {
  const urgency = patient.guardrailResult?.finalUrgencyLevel || 'Low';
  const patientName = patient.basicInfo?.name || 'Anonymous Patient';
  const age = patient.basicInfo?.age;
  const primarySymptoms = patient.structuredIntake?.primarySymptoms || [];
  const symptomText = patient.symptomExplanation;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Patient Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Patient Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{patientName}</h3>
            {age && <span className="text-sm text-gray-500">Age {age}</span>}
          </div>

          {/* Symptoms */}
          {primarySymptoms.length > 0 ? (
            <p className="mb-2 text-gray-700">
              {primarySymptoms.slice(0, 2).join(' • ')}
            </p>
          ) : symptomText ? (
            <p className="mb-2 text-gray-700">
              {symptomText.slice(0, 60)}...
            </p>
          ) : (
            <p className="mb-2 italic text-gray-400">No symptoms recorded</p>
          )}

          {/* Time */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTimeAgo(patient.createdAt)}
          </div>
        </div>

        {/* Urgency Badge & Arrow */}
        <div className="flex items-center gap-3">
          <UrgencyBadge level={urgency} size="md" />
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
