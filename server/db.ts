import { MongoClient, ServerApiVersion } from 'mongodb';
import { log } from './vite';

// MongoDB connection URI - Using hardcoded value for MongoDB Atlas
const mongoUri = "mongodb+srv://tukawael452:I2M7aXdZT9oOg0B6@cluster0.udwgvo2.mongodb.net/ecommerce";
log(`Using MongoDB Atlas connection...`);

// Create a MongoDB client with timeout options
const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Set shorter timeouts to avoid blocking startup
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
});

let dbInstance: MongoClient | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

/**
 * Connect to MongoDB Atlas database
 * @returns {Promise<MongoClient>} MongoDB client instance
 */
export async function connectToDatabase(): Promise<MongoClient> {
  // Use existing connection promise if one is in progress
  if (connectionPromise) {
    return connectionPromise;
  }
  
  // Use existing connection if available
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  
  // Create a new connection promise
  connectionPromise = new Promise<MongoClient>(async (resolve, reject) => {
    try {
      log('Connecting to MongoDB Atlas...', 'express');
      const newClient = await client.connect();
      dbInstance = newClient;
      log('MongoDB Atlas database connected successfully', 'express');
      resolve(newClient);
    } catch (error) {
      log(`Error connecting to MongoDB: ${error}`, 'express');
      reject(error);
    } finally {
      connectionPromise = null;
    }
  });
  
  return connectionPromise;
}

/**
 * Get the database instance
 * @returns MongoDB database instance
 */
export function getDb() {
  if (!dbInstance) {
    throw new Error('MongoDB connection not initialized. Call connectToDatabase() first.');
  }
  return dbInstance.db('ecommerce');
}

/**
 * Get a collection from the database
 * @param {string} collectionName - Name of the collection
 * @returns MongoDB collection
 */
export function getCollection(collectionName: string) {
  return getDb().collection(collectionName);
}
