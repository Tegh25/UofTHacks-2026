/**
 * Screen 2: Symptom Explanation
 * Allows patient to describe symptoms via text or (mocked) speech input.
 */

import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SymptomExplanationScreen({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);

  /**
   * STUB: Simulates speech-to-text input.
   * TODO: Integrate real speech API (e.g., Web Speech API, Deepgram, etc.)
   */
  const handleMicClick = () => {
    if (isRecording) {
      // Stop recording (simulated)
      setIsRecording(false);
    } else {
      // Start recording (simulated)
      setIsRecording(true);

      // Simulate transcription after 2 seconds
      setTimeout(() => {
        const mockTranscript =
          "I've had a headache for the past two days and I feel dizzy when I stand up.";
        onChange(value ? `${value} ${mockTranscript}` : mockTranscript);
        setIsRecording(false);
      }, 2000);
    }
  };

  const charCount = value.length;
  const maxChars = 1000;

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Progress Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 2 of 7</span>
            <span className="font-medium text-primary">Symptoms</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: '28.6%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="text-primary">Reason</span>
            <span className="font-medium text-primary">Symptoms</span>
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
        <div className="w-full max-w-3xl">
          <h1 className="mb-3 text-center text-4xl font-bold text-gray-900">
            Tell us what's happening
          </h1>
          <p className="mb-8 text-center text-lg text-gray-600">
            Describe your symptoms in your own words. You can type or use voice.
          </p>

          <div className="relative">
            {/* Text area for symptom input */}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="For example: I've had a headache for two days, mostly on the left side. It gets worse when I look at bright lights..."
              maxLength={maxChars}
              rows={8}
              aria-label="Symptom description"
              className="w-full resize-none rounded-2xl border-2 border-gray-300 bg-white p-6 text-lg shadow-sm focus:border-primary focus:outline-none"
            />

            {/* Microphone button - positioned at bottom right */}
            <button
              onClick={handleMicClick}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              className={`absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-lg transition ${
                isRecording
                  ? 'animate-pulse bg-red-500 text-white'
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              🎤
            </button>
          </div>

          {/* Character count */}
          <div className="mt-3 text-right text-sm text-gray-500">
            {charCount} / {maxChars}
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
              disabled={value.trim().length < 10}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
