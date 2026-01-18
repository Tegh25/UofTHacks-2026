import { MongoClient, ObjectId } from 'mongodb';

let db = null;

/**
 * Connect to MongoDB using credentials from environment variables.
 */
export async function connectMongo() {
  if (db) return db;

  const user = process.env.mongodb_cluster_username;
  const password = process.env.mongodb_cluster_password;

  if (!user || !password) {
    throw new Error('MongoDB credentials not found in environment variables');
  }

  const uri = `mongodb+srv://${user}:${password}@triageai-patient-intake.i9gpcgt.mongodb.net/?appName=triageai-patient-intake`;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('triageai');
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
  return db;
}

/**
 * Get the patients collection.
 */
function getCollection() {
  if (!db) throw new Error('Database not connected');
  return db.collection('patients');
}

/**
 * Create a new patient record.
 */
export async function createPatientRecord(record) {
  const collection = getCollection();
  const now = new Date().toISOString();
  const doc = {
    ...record,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc);
  return { id: result.insertedId.toString(), ...doc };
}

/**
 * Update an existing patient record by ID.
 */
export async function updatePatientRecord(id, updates) {
  const collection = getCollection();
  const now = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: now } },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * Get all patient records.
 */
export async function getAllPatients() {
  const collection = getCollection();
  const docs = await collection.find({}).toArray();
  return docs.map((doc) => ({ id: doc._id.toString(), ...doc }));
}

/**
 * Get a single patient record by ID.
 */
export async function getPatientById(id) {
  const collection = getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { id: doc._id.toString(), ...doc };
}

/**
 * Clear all patient records (demo/testing only).
 */
export async function clearAllPatients() {
  const collection = getCollection();
  const result = await collection.deleteMany({});
  return { deletedCount: result.deletedCount };
}
