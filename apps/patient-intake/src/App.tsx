/**
 * App.tsx — Main application component
 * Manages intake flow state and screen navigation.
 */

import { useState } from 'react';
import {
  IntakeState,
  initialIntakeState,
  EntryCategory,
  BasicInfo,
  VitalsData,
} from './types';
import { submitIntake } from './api';

import EntryCategoryScreen from './screens/EntryCategoryScreen';
import SymptomExplanationScreen from './screens/SymptomExplanationScreen';
import PassiveVitalsScreen from './screens/PassiveVitalsScreen';
import BasicInfoScreen from './screens/BasicInfoScreen';
import PreExistingConditionsScreen from './screens/PreExistingConditionsScreen';
import ReviewConfirmScreen from './screens/ReviewConfirmScreen';
import SuccessScreen from './screens/SuccessScreen';

/**
 * Steps in the intake flow:
 * 0 - Entry Category Selection
 * 1 - Symptom Explanation
 * 2 - Passive Vitals Capture
 * 3 - Basic Information
 * 4 - Pre-Existing Conditions
 * 5 - Review & Confirm
 * 6 - Success
 */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function App() {
  const [step, setStep] = useState<Step>(0);
  const [intake, setIntake] = useState<IntakeState>(initialIntakeState);
  const [intakeId, setIntakeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation helpers
  const goNext = () => setStep((s) => Math.min(s + 1, 6) as Step);
  const goBack = () => setStep((s) => Math.max(s - 1, 0) as Step);
  const goToStep = (s: number) => setStep(s as Step);

  // Reset entire flow
  const resetFlow = () => {
    setIntake(initialIntakeState);
    setStep(0);
    setIntakeId('');
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitIntake(intake);
      if (result.success) {
        setIntakeId(result.intakeId);
        setStep(6);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Submission failed:', error);
      // In a real app, show error UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update helpers for each section
  const setEntryCategory = (category: EntryCategory) => {
    setIntake((prev) => ({ ...prev, entryCategory: category }));
    goNext();
  };

  const setSymptomExplanation = (text: string) => {
    setIntake((prev) => ({ ...prev, symptomExplanation: text }));
  };

  const setVitals = (vitals: VitalsData) => {
    setIntake((prev) => ({ ...prev, vitals }));
    goNext();
  };

  const setBasicInfo = (info: BasicInfo) => {
    setIntake((prev) => ({ ...prev, basicInfo: info }));
  };

  const setConditions = (conditions: string[]) => {
    setIntake((prev) => ({ ...prev, preExistingConditions: conditions }));
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <EntryCategoryScreen onSelect={setEntryCategory} />;

      case 1:
        return (
          <SymptomExplanationScreen
            value={intake.symptomExplanation}
            onChange={setSymptomExplanation}
            onNext={goNext}
            onBack={goBack}
          />
        );

      case 2:
        return (
          <PassiveVitalsScreen onComplete={setVitals} onBack={goBack} />
        );

      case 3:
        return (
          <BasicInfoScreen
            value={intake.basicInfo}
            onChange={setBasicInfo}
            onNext={goNext}
            onBack={goBack}
          />
        );

      case 4:
        return (
          <PreExistingConditionsScreen
            value={intake.preExistingConditions}
            onChange={setConditions}
            onNext={goNext}
            onBack={goBack}
          />
        );

      case 5:
        return (
          <ReviewConfirmScreen
            intake={intake}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        );

      case 6:
        return <SuccessScreen intakeId={intakeId} onReset={resetFlow} />;

      default:
        return null;
    }
  };

  // Show loading overlay during submission
  if (isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 text-5xl">⏳</div>
          <p className="text-xl text-gray-600">Submitting your intake...</p>
        </div>
      </div>
    );
  }

  return renderStep();
}
