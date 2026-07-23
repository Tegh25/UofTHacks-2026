/**
 * API functions for intake submission.
 */

import type { IntakeState } from './types';

const API_BASE = 'http://localhost:3001';

/**
 * Submit the patient intake to the backend.
 * POST /intake
 */
export async function submitIntake(
  intake: IntakeState
): Promise<{ success: boolean; intakeId: string }> {
  const response = await fetch(`${API_BASE}/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intake),
  });

  if (!response.ok) {
    throw new Error(`Intake submission failed: ${response.status}`);
  }

  return response.json();
}
