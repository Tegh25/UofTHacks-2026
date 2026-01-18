/**
 * Doctor Dashboard - Main Application
 * Shows triaged patient list with auto-refresh and detail views.
 */

import { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import PatientListView from './components/PatientListView';
import PatientDetailView from './components/PatientDetailView';
import { fetchPatients, fetchPatientById, clearDemoData } from './api';
import type { PatientRecord } from './types';

const POLL_INTERVAL = 5000; // 5 seconds

export default function App() {
  // State
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all patients from the API.
   */
  const loadPatients = useCallback(async () => {
    try {
      const data = await fetchPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to load patients. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle selecting a patient to view details.
   */
  const handleSelectPatient = async (id: string) => {
    try {
      const patient = await fetchPatientById(id);
      setSelectedPatient(patient);
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
      setError('Failed to load patient details.');
    }
  };

  /**
   * Handle going back to the list view.
   */
  const handleBack = () => {
    setSelectedPatient(null);
  };

  /**
   * Handle manual refresh.
   */
  const handleRefresh = () => {
    setIsLoading(true);
    loadPatients();
  };

  /**
   * Handle clearing demo data.
   */
  const handleClearDemoData = async () => {
    try {
      await clearDemoData();
      setPatients([]);
      setSelectedPatient(null);
    } catch (err) {
      console.error('Failed to clear demo data:', err);
      setError('Failed to clear demo data.');
    }
  };

  /**
   * Initial load and polling setup.
   */
  useEffect(() => {
    loadPatients();

    // Set up polling
    const interval = setInterval(loadPatients, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [loadPatients]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavBar 
        onRefresh={handleRefresh} 
        onClearData={handleClearDemoData}
        isLoading={isLoading}
      />

      {/* Error banner */}
      {error && (
        <div className="bg-red-100 border-b border-red-300 px-6 py-3 text-center text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-600 underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {selectedPatient ? (
          <PatientDetailView patient={selectedPatient} onBack={handleBack} />
        ) : (
          <PatientListView
            patients={patients}
            onSelectPatient={handleSelectPatient}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}
