import { Router } from 'express';
import { createPatientRecord, updatePatientRecord } from '../db/mongo.js';
import { initialAgentStates, runTriagePipeline } from '../agents/triageGraph.js';

export const intakeRouter = Router();

/**
 * POST /intake
 * Creates a patient record and kicks off the triage pipeline in the
 * background. Responds immediately so the kiosk isn't blocked while
 * agents run.
 */
intakeRouter.post('/', async (req, res) => {
  const {
    entryCategory,
    symptomExplanation,
    vitals,
    basicInfo,
    preExistingConditions,
  } = req.body ?? {};

  if (typeof symptomExplanation !== 'string' || symptomExplanation.trim().length === 0) {
    return res.status(400).json({ error: 'symptomExplanation is required' });
  }

  try {
    const record = await createPatientRecord({
      entryCategory: entryCategory ?? null,
      symptomExplanation: symptomExplanation.trim(),
      vitals: {
        heartRate: null,
        respirationRate: null,
        captured: false,
        ...(vitals ?? {}),
      },
      basicInfo: {
        name: '',
        age: null,
        sexAtBirth: null,
        preferredLanguage: 'English',
        ...(basicInfo ?? {}),
      },
      preExistingConditions: Array.isArray(preExistingConditions)
        ? preExistingConditions
        : [],
      agentStates: initialAgentStates(),
      triageStatus: 'processing',
    });

    res.status(201).json({ success: true, intakeId: record.id });

    // Fire-and-forget: agents persist their own progress to MongoDB.
    runTriagePipeline(record).catch(async (error) => {
      // eslint-disable-next-line no-console
      console.error('Background triage pipeline error:', error.message);
      await updatePatientRecord(record.id, { triageStatus: 'error' }).catch(() => {});
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating intake:', error);
    res.status(500).json({ error: 'Failed to create intake' });
  }
});
