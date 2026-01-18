import { Router } from 'express';
import { getAllPatients, getPatientById } from '../db/mongo.js';

export const patientsRouter = Router();

patientsRouter.get('/', async (_req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

patientsRouter.get('/:id', async (req, res) => {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});
