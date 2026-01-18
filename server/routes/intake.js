import { Router } from 'express';

export const intakeRouter = Router();

intakeRouter.post('/', (_req, res) => {
  // TODO: handle intake submission
  res.status(501).json({ message: 'Not implemented' });
});
