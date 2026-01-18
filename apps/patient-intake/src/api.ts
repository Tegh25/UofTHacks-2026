/**
 * Stub API functions for intake submission.
 * These are placeholders; actual HTTP logic goes here later.
 */

import type { IntakeState } from './types';

/**
 * Submit the patient intake to the backend.
 * STUB: Simulates a successful API call.
 *
 * TODO: Replace with real fetch() call to POST /intake
 */
export async function submitIntake(
  intake: IntakeState
): Promise<{ success: boolean; intakeId: string }> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // eslint-disable-next-line no-console
  console.log('[STUB] submitIntake called with:', intake);

  // Return simulated success response
  return {
    success: true,
    intakeId: `INT-${Date.now()}`,
  };
}
