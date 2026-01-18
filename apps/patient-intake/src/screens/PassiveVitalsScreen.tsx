/**
 * Screen 3: Passive Vitals Capture (Optional, Non-Blocking)
 * Simulates passive vitals capture while patient waits.
 * The Continue button is ALWAYS enabled.
 */

import { useState, useEffect } from 'react';
import type { VitalsData } from '../types';

interface Props {
  onComplete: (vitals: VitalsData) => void;
  onBack: () => void;
}

export default function PassiveVitalsScreen({ onComplete, onBack }: Props) {
  const [progress, setProgress] = useState(0);
  const [captured, setCaptured] = useState(false);

  /**
   * STUB: Simulates vitals capture progress.
   * TODO: Integrate Presage SDK or camera-based vitals here.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCaptured(true);
          return 100;
        }
        return prev + 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    // Return simulated vitals data (or empty if skipped)
    const vitals: VitalsData = captured
      ? {
          heartRate: 72, // Mock value
          respirationRate: 16, // Mock value
          captured: true,
        }
      : {
          heartRate: null,
          respirationRate: null,
          captured: false,
        };
    onComplete(vitals);
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="mb-3 text-center text-4xl font-bold text-gray-900">
            Quick Health Check
          </h1>
          <p className="mb-10 text-center text-lg text-gray-600">
            We are checking non-invasive signals to help prioritize care. This is
            optional and does not affect your visit.
          </p>

          {/* Camera placeholder / vitals display area */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
            {/* Camera feed placeholder */}
            <div className="mb-6 flex h-64 items-center justify-center rounded-2xl bg-gray-100">
              <div className="text-center">
                <div className="mb-3 text-6xl" aria-hidden="true">
                  📷
                </div>
                <p className="text-sm text-gray-500">
                  {captured ? 'Analysis complete' : `Scanning... ${progress}%`}
                </p>
              </div>
            </div>

            {/* Vitals results */}
            {captured && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❤️</span>
                    <span className="font-medium text-gray-900">Heart Rate</span>
                  </div>
                  <span className="font-bold text-green-600">72 bpm ✓</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🫁</span>
                    <span className="font-medium text-gray-900">
                      Respiratory Rate
                    </span>
                  </div>
                  <span className="font-bold text-green-600">16 /min ✓</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span className="font-medium text-gray-900">Stress Level</span>
                  </div>
                  <span className="font-bold text-green-600">Normal ✓</span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 rounded-xl bg-blue-50 p-4">
            <div className="flex gap-3">
              <span className="text-blue-600">ℹ️</span>
              <p className="text-sm text-gray-700">
                This optional check uses your camera to estimate vital signs. You
                can skip this step at any time. Clinical staff will take accurate
                measurements during your visit.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={onBack}
              className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Skip This Step
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-primary-hover"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
