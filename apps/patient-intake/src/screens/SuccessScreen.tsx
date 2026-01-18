/**
 * Screen 7: Submission Success
 * Confirms intake was submitted and provides next steps.
 */

import { useEffect, useState } from 'react';

interface Props {
  intakeId: string;
  onReset: () => void;
}

const AUTO_RESET_SECONDS = 15;

export default function SuccessScreen({ intakeId, onReset }: Props) {
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);

  // Auto-reset countdown
  useEffect(() => {
    if (countdown <= 0) {
      onReset();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onReset]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
      {/* Success icon */}
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-green-100">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-6xl text-white">
          ✓
        </div>
      </div>

      <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
        Intake Complete!
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-600">
        Your intake has been sent to the care team.
      </p>

      {/* Intake ID */}
      <div className="mb-10 rounded-2xl bg-gray-100 px-8 py-5 text-center">
        <p className="mb-2 text-sm text-gray-500">Your intake reference:</p>
        <p className="text-xl font-mono font-bold text-gray-900">{intakeId}</p>
      </div>

      {/* Next Steps */}
      <div className="mb-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">→</span>
          <h2 className="text-lg font-semibold text-gray-900">Next Steps</h2>
        </div>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              1
            </span>
            <span className="text-gray-700">
              Please proceed to the waiting area
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              2
            </span>
            <span className="text-gray-700">A staff member will call your name</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              3
            </span>
            <span className="text-gray-700">
              Clinical staff will review your intake
            </span>
          </li>
        </ol>
      </div>

      <p className="mb-6 flex items-center gap-2 text-center text-sm text-gray-500">
        <span>🕐</span>
        This screen will reset in {countdown} seconds
      </p>

      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        🔄 Start New Patient
      </button>
    </main>
  );
}
