/**
 * Screen 4: Basic Information
 * Collects minimal demographic context from the patient.
 */

import type { BasicInfo } from '../types';

interface Props {
  value: BasicInfo;
  onChange: (info: BasicInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BasicInfoScreen({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const handleChange = (field: keyof BasicInfo, val: string | number | null) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Progress Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 4 of 7</span>
            <span className="font-medium text-primary">Info</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: '57.1%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="text-primary">Reason</span>
            <span className="text-primary">Symptoms</span>
            <span className="text-primary">Vitals</span>
            <span className="font-medium text-primary">Info</span>
            <span>History</span>
            <span>Review</span>
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="mb-3 text-center text-4xl font-bold text-gray-900">
            A bit about you
          </h1>
          <p className="mb-10 text-center text-lg text-gray-600">
            This helps us prepare for your visit. All fields except age are
            optional.
          </p>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 flex items-center gap-2 text-base font-medium text-gray-700"
              >
                <span className="text-primary">👤</span>
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                value={value.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="How should we address you?"
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="mb-2 flex items-center gap-2 text-base font-medium text-gray-700"
              >
                <span className="text-primary">📅</span>
                Age
              </label>
              <div className="flex gap-3">
                <select
                  id="age"
                  value={value.age ?? ''}
                  onChange={(e) =>
                    handleChange('age', e.target.value ? Number(e.target.value) : null)
                  }
                  className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-lg shadow-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Select your age</option>
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  🔮 Suggest
                </button>
              </div>
            </div>

            {/* Sex at birth */}
            <div>
              <label
                htmlFor="sexAtBirth"
                className="mb-2 flex items-center gap-2 text-base font-medium text-gray-700"
              >
                <span className="text-primary">👥</span>
                Sex at birth
              </label>
              <select
                id="sexAtBirth"
                value={value.sexAtBirth ?? 'prefer_not_to_say'}
                onChange={(e) =>
                  handleChange(
                    'sexAtBirth',
                    e.target.value === 'prefer_not_to_say' ? null : e.target.value
                  )
                }
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-lg shadow-sm focus:border-primary focus:outline-none"
              >
                <option value="prefer_not_to_say">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Preferred language */}
            <div>
              <label
                htmlFor="language"
                className="mb-2 flex items-center gap-2 text-base font-medium text-gray-700"
              >
                <span className="text-primary">🌐</span>
                Preferred language
              </label>
              <select
                id="language"
                value={value.preferredLanguage}
                onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-lg shadow-sm focus:border-primary focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex justify-between gap-4">
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
