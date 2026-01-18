/**
 * Screen 5: Pre-Existing Conditions
 * Allows patient to select relevant medical context.
 * Suggestions are MOCK data; no AI inference.
 */

import { useState } from 'react';

interface Props {
  value: string[];
  onChange: (conditions: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * MOCK suggested conditions.
 * TODO: These could be AI-suggested based on symptom text,
 * but are static for the demo.
 */
const suggestedConditions = [
  'High blood pressure',
  'Diabetes',
  'Asthma',
  'Heart disease',
  'Allergies',
  'Arthritis',
  'Anxiety or depression',
  'Chronic pain',
];

export default function PreExistingConditionsScreen({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [customCondition, setCustomCondition] = useState('');

  const toggleCondition = (condition: string) => {
    if (value.includes(condition)) {
      onChange(value.filter((c) => c !== condition));
    } else {
      onChange([...value, condition]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customCondition.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomCondition('');
    }
  };

  const handleNone = () => {
    onChange([]);
  };

  const isNoneSelected = value.length === 0;

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Progress Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 5 of 7</span>
            <span className="font-medium text-primary">History</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: '71.4%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="text-primary">Reason</span>
            <span className="text-primary">Symptoms</span>
            <span className="text-primary">Vitals</span>
            <span className="text-primary">Info</span>
            <span className="font-medium text-primary">History</span>
            <span>Review</span>
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl">📋</span>
            <h1 className="text-center text-4xl font-bold text-gray-900">
              Medical History
            </h1>
          </div>
          <p className="mb-8 text-center text-lg text-gray-600">
            Select any conditions that apply to you. These are not diagnoses —
            just information to help your care team.
          </p>

          <div className="mb-6 rounded-xl bg-blue-50 p-4">
            <div className="flex gap-3">
              <span className="text-blue-600">ℹ️</span>
              <p className="text-sm text-gray-700">
                This list is based on common conditions. You can add your own if
                needed.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Suggested conditions */}
            <div className="space-y-2">
              {suggestedConditions.map((condition) => (
                <label
                  key={condition}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 text-lg transition ${
                    value.includes(condition)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(condition)}
                    onChange={() => toggleCondition(condition)}
                    className="h-5 w-5 accent-primary"
                  />
                  <span
                    className={`flex-1 ${
                      value.includes(condition)
                        ? 'font-medium text-primary'
                        : 'text-gray-800'
                    }`}
                  >
                    {condition}
                  </span>
                </label>
              ))}

              {/* None of these option */}
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 text-lg transition ${
                  isNoneSelected
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isNoneSelected}
                  onChange={handleNone}
                  className="h-5 w-5 accent-primary"
                />
                <span
                  className={`flex-1 ${
                    isNoneSelected
                      ? 'font-medium text-primary'
                      : 'text-gray-800'
                  }`}
                >
                  None of these apply to me
                </span>
              </label>
            </div>

            {/* Add custom condition */}
            <button
              onClick={() => {
                const input = document.getElementById('custom-condition');
                input?.focus();
              }}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="text-xl">+</span>
              <span className="font-medium">Add another condition</span>
            </button>

            <div className="flex gap-2">
              <input
                id="custom-condition"
                type="text"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Type condition name..."
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
            </div>

            {/* Display custom additions */}
            {value.filter((c) => !suggestedConditions.includes(c)).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Your additions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {value
                    .filter((c) => !suggestedConditions.includes(c))
                    .map((c) => (
                      <span
                        key={c}
                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-white"
                      >
                        {c}
                        <button
                          onClick={() => onChange(value.filter((x) => x !== c))}
                          aria-label={`Remove ${c}`}
                          className="hover:text-gray-200"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Select all that apply, or choose "None of these"
          </p>

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={onNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-primary-hover"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
