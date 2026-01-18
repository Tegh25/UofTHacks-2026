import express from 'express';
import cors from 'cors';
import { connectMongo } from './db/mongo.js';
import { intakeRouter } from './routes/intake.js';
import { patientsRouter } from './routes/patients.js';
import { demoRouter } from './routes/demo.js';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for requests from doctor dashboard and other frontends
app.use(cors());
app.use(express.json());

// TODO: initialize database connection
connectMongo();

app.use('/intake', intakeRouter);
app.use('/patients', patientsRouter);
app.use('/clear-demo-data', demoRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
