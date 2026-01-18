import { Router } from 'express';

export const patientsRouter = Router();

patientsRouter.get('/', (_req, res) => {
  // TODO: return patient list
  res.status(501).json({ message: 'Not implemented' });
});

patientsRouter.get('/:id', (_req, res) => {
  // TODO: return patient record by ID
  res.status(501).json({ message: 'Not implemented' });
});
