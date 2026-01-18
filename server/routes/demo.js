import { Router } from 'express';

export const demoRouter = Router();

demoRouter.post('/', (_req, res) => {
  // TODO: clear demo data
  res.status(501).json({ message: 'Not implemented' });
});
