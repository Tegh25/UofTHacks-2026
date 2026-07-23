import { randomUUID } from 'node:crypto';
import { MongoClient, ObjectId } from 'mongodb';

let db = null;

// Demo-stability fallback: if MongoDB Atlas is unreachable (e.g. this
// machine's IP is not on the cluster's Network Access list), we fall back
// to an in-memory store with the same interface so the end-to-end demo
// still works. Data is lost on restart — a loud warning is logged.
let memoryStore = null;

/**
 * Connect to MongoDB using credentials from environment variables.
 * Falls back to an in-memory store if the cluster is unreachable.
 */
export async function connectMongo() {
  if (db || memoryStore) return db;

  const user = process.env.mongodb_cluster_username;
  const password = process.env.mongodb_cluster_password;

  try {
    if (!user || !password) {
      throw new Error('MongoDB credentials not found in environment variables');
    }

    const uri = `mongodb+srv://${user}:${password}@triageai-patient-intake.i9gpcgt.mongodb.net/?appName=triageai-patient-intake`;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    await client.db('triageai').command({ ping: 1 });
    db = client.db('triageai');
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    memoryStore = new Map();
    // eslint-disable-next-line no-console
    console.warn(
      [
        '',
        '⚠  Could not reach MongoDB Atlas — using IN-MEMORY storage instead.',
        `   Reason: ${error.message.split('\n')[0]}`,
        '   Data will NOT persist across server restarts.',
        '   Fix: add this machine\'s IP to the Atlas Network Access list',
        '   (or allow 0.0.0.0/0 for the hackathon), then restart the server.',
        '',
      ].join('\n')
    );
    return null;
  }
}

/**
 * True when the in-memory fallback is active instead of real MongoDB.
 */
export function isUsingMemoryStore() {
  return memoryStore !== null;
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
  const now = new Date().toISOString();
  const doc = {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: now,
  };

  if (memoryStore) {
    const id = randomUUID();
    memoryStore.set(id, { ...doc, _id: id });
    return { id, ...doc };
  }

  const collection = getCollection();
  const result = await collection.insertOne(doc);
  return { id: result.insertedId.toString(), ...doc };
}

/**
 * Update an existing patient record by ID.
 */
export async function updatePatientRecord(id, updates) {
  const now = new Date().toISOString();

  if (memoryStore) {
    const existing = memoryStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: now };
    memoryStore.set(id, updated);
    return updated;
  }

  const collection = getCollection();
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
  if (memoryStore) {
    return [...memoryStore.values()].map((doc) => ({ id: doc._id, ...doc }));
  }

  const collection = getCollection();
  const docs = await collection.find({}).toArray();
  return docs.map((doc) => ({ id: doc._id.toString(), ...doc }));
}

/**
 * Get a single patient record by ID.
 */
export async function getPatientById(id) {
  if (memoryStore) {
    const doc = memoryStore.get(id);
    return doc ? { id: doc._id, ...doc } : null;
  }

  const collection = getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { id: doc._id.toString(), ...doc };
}

/**
 * Clear all patient records (demo/testing only).
 */
export async function clearAllPatients() {
  if (memoryStore) {
    const deletedCount = memoryStore.size;
    memoryStore.clear();
    return { deletedCount };
  }

  const collection = getCollection();
  const result = await collection.deleteMany({});
  return { deletedCount: result.deletedCount };
}
