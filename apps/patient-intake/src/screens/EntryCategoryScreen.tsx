/**
 * Screen 1: Entry Category Selection
 * Allows patient to select why they are seeking care.
 */

import type { EntryCategory } from '../types';

interface Props {
  onSelect: (category: EntryCategory) => void;
}

const categories: {
  id: EntryCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    id: 'pain',
    label: "I'm in pain",
    icon: '❤️',
    color: 'bg-gradient-to-r from-red-500 to-red-400',
  },
  {
    id: 'unwell',
    label: 'I feel unwell',
    icon: '🌡️',
    color: 'bg-gradient-to-r from-orange-500 to-orange-400',
  },
  {
    id: 'injured',
    label: 'I was injured',
    icon: '🦴',
    color: 'bg-gradient-to-r from-purple-500 to-purple-400',
  },
  {
    id: 'worried',
    label: "I'm worried / something feels wrong",
    icon: 'ℹ️',
    color: 'bg-gradient-to-r from-blue-500 to-blue-400',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '❓',
    color: 'bg-gradient-to-r from-gray-500 to-gray-400',
  },
];

export default function EntryCategoryScreen({ onSelect }: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Progress Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 1 of 7</span>
            <span className="font-medium text-primary">Reason</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: '14.3%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-primary">Reason</span>
            <span>Symptoms</span>
            <span>Vitals</span>
            <span>Info</span>
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
            What brings you in today?
          </h1>
          <p className="mb-10 text-center text-lg text-gray-600">
            Select the option that best describes your situation
          </p>

          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                aria-label={cat.label}
                className={`flex items-center gap-4 rounded-2xl px-8 py-6 text-left text-xl font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg ${cat.color}`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Your privacy is protected. Information is shared only with care staff.
          </p>
        </div>
      </div>
    </main>
  );
}
