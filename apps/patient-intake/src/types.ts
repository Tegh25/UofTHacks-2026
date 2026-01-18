/**
 * Type definitions for the patient intake flow.
 * UI-only types; no backend or AI logic.
 */

export type EntryCategory =
  | 'pain'
  | 'unwell'
  | 'injured'
  | 'worried'
  | 'other';

export interface BasicInfo {
  name: string;
  age: number | null;
  sexAtBirth: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  preferredLanguage: string;
}

export interface VitalsData {
  heartRate: number | null;
  respirationRate: number | null;
  captured: boolean;
}

export interface IntakeState {
  entryCategory: EntryCategory | null;
  symptomExplanation: string;
  vitals: VitalsData;
  basicInfo: BasicInfo;
  preExistingConditions: string[];
}

export const initialIntakeState: IntakeState = {
  entryCategory: null,
  symptomExplanation: '',
  vitals: {
    heartRate: null,
    respirationRate: null,
    captured: false,
  },
  basicInfo: {
    name: '',
    age: null,
    sexAtBirth: null,
    preferredLanguage: 'English',
  },
  preExistingConditions: [],
};
