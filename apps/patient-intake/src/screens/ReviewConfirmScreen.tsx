/**
 * Screen 6: Review & Confirm
 * Allows patient to verify all information before submission.
 */

import type { IntakeState, EntryCategory } from '../types';

interface Props {
  intake: IntakeState;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const categoryLabels: Record<EntryCategory, string> = {
  pain: "I'm in pain",
  unwell: 'I feel unwell',
  injured: 'I was injured',
  worried: "I'm worried / something feels wrong",
  other: 'Other',
};

export default function ReviewConfirmScreen({
  intake,
  onEdit,
  onSubmit,
  onBack,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Progress Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 6 of 7</span>
            <span className="font-medium text-primary">Review</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: '85.7%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="text-primary">Reason</span>
            <span className="text-primary">Symptoms</span>
            <span className="text-primary">Vitals</span>
            <span className="text-primary">Info</span>
            <span className="text-primary">History</span>
            <span className="font-medium text-primary">Review</span>
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center px-6 py-12">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-3 text-center text-4xl font-bold text-gray-900">
            Review Your Information
          </h1>
          <p className="mb-10 text-center text-lg text-gray-600">
            Please confirm that everything is correct before submitting.
          </p>

          <div className="space-y-4">
            {/* Entry category */}
            <Section
              title="Reason for Visit"
              icon="🏥"
              onEdit={() => onEdit(0)}
            >
              <p className="text-base text-gray-700">
                {intake.entryCategory
                  ? categoryLabels[intake.entryCategory]
                  : 'Not selected'}
              </p>
            </Section>

            {/* Symptom explanation */}
            <Section
              title="Your Symptoms"
              icon="📝"
              onEdit={() => onEdit(1)}
            >
              <p className="text-base italic text-gray-700">
                {intake.symptomExplanation || 'No description provided'}
              </p>
            </Section>

            {/* Vitals (optional display) */}
            {intake.vitals.captured && (
              <Section
                title="Health Check"
                icon="❤️"
                onEdit={() => onEdit(2)}
              >
                <p className="text-base text-green-600">Completed</p>
              </Section>
            )}

            {/* Basic info */}
            <Section
              title="Your Information"
              icon="👤"
              onEdit={() => onEdit(3)}
            >
              <div className="space-y-1 text-base text-gray-700">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {intake.basicInfo.name || (
                    <span className="italic text-gray-400">Not provided</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Age:</span>{' '}
                  {intake.basicInfo.age !== null ? (
                    intake.basicInfo.age
                  ) : (
                    <span className="italic text-gray-400">Not provided</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Sex at birth:</span>{' '}
                  {intake.basicInfo.sexAtBirth || (
                    <span className="italic text-gray-400">Not Provided</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Language:</span>{' '}
                  {intake.basicInfo.preferredLanguage}
                </p>
              </div>
            </Section>

            {/* Pre-existing conditions */}
            <Section
              title="Medical History"
              icon="📋"
              onEdit={() => onEdit(4)}
            >
              {intake.preExistingConditions.length > 0 ? (
                <ul className="list-inside list-disc text-base text-gray-700">
                  {intake.preExistingConditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-400">No conditions reported</p>
              )}
            </Section>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-xl bg-blue-50 p-5">
            <div className="flex gap-3">
              <span className="text-blue-600">ℹ️</span>
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> This information will be reviewed by
                clinical staff. A medical professional will see you shortly.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex justify-between gap-4">
            <button
              onClick={onBack}
              className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Start Over
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-orange-700"
            >
              Submit Intake
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Reusable section component with edit button.
 */
function Section({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={onEdit}
          className="text-sm font-medium text-primary hover:underline"
        >
          ✏️ Edit
        </button>
      </div>
      {children}
    </div>
  );
}
