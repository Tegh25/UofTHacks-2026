/**
 * API service for the doctor dashboard.
 * Consumes backend endpoints for patient data.
 */

import type { PatientRecord } from './types';

const API_BASE = 'http://localhost:3001';

/**
 * Fetch all patients from the backend.
 * GET /patients
 */
export async function fetchPatients(): Promise<PatientRecord[]> {
  const response = await fetch(`${API_BASE}/patients`);
  if (!response.ok) {
    throw new Error(`Failed to fetch patients: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a single patient by ID.
 * GET /patients/:id
 */
export async function fetchPatientById(id: string): Promise<PatientRecord> {
  const response = await fetch(`${API_BASE}/patients/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Clear all demo data (demo utility).
 * POST /clear-demo-data
 */
export async function clearDemoData(): Promise<{ deletedCount: number }> {
  const response = await fetch(`${API_BASE}/clear-demo-data`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear demo data: ${response.statusText}`);
  }
  return response.json();
}
