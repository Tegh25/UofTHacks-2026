import { Router } from 'express';
import { clearAllPatients } from '../db/mongo.js';

export const demoRouter = Router();

demoRouter.post('/', async (_req, res) => {
  try {
    const result = await clearAllPatients();
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error clearing demo data:', error);
    res.status(500).json({ error: 'Failed to clear demo data' });
  }
});
