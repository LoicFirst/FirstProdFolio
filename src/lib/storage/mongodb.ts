import { MongoClient, Db, Collection, Document } from 'mongodb';
import { AboutDocument, ContactDocument, PhotoDocument, VideoDocument } from './types';

/**
 * MongoDB connection utility for portfolio data storage
 * 
 * This module handles the connection to MongoDB and provides access to collections
 * for storing portfolio data (about, photos, videos, contact info).
 * 
 * Environment variable required: MONGODB_URI
 */

// MongoDB connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    '[MongoDB] WARNING: MONGODB_URI is not defined. ' +
    'Database operations will fail. This is expected during build time. ' +
    'Set MONGODB_URI in your .env.local file for local development, ' +
    'or in Vercel Environment Variables for production.'
  );
}

// Database name
const DB_NAME = 'portfolio';

// Collection names
export const COLLECTIONS = {
  ABOUT: 'about',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  CONTACT: 'contact',
} as const;

// Global connection cache for serverless environments
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

/**
 * Connect to MongoDB and cache the connection
 * This function reuses connections in serverless environments
 */
export async function connectToDatabase(): Promise<MongoConnection> {
  // Return cached connection if available
  if (cachedConnection) {
    console.log('[MongoDB] Using cached database connection');
    return cachedConnection;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  console.log('[MongoDB] Connecting to MongoDB...');

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    cachedConnection = { client, db };
    console.log('[MongoDB] ✓ Connected successfully to database:', DB_NAME);
    
    return cachedConnection;
  } catch (error) {
    console.error('[MongoDB] ❌ Connection failed:', error);
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific collection from the database
 */
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Get the about collection
 */
export async function getAboutCollection() {
  return getCollection<AboutDocument>(COLLECTIONS.ABOUT);
}

/**
 * Get the photos collection
 */
export async function getPhotosCollection() {
  return getCollection<PhotoDocument>(COLLECTIONS.PHOTOS);
}

/**
 * Get the videos collection
 */
export async function getVideosCollection() {
  return getCollection<VideoDocument>(COLLECTIONS.VIDEOS);
}

/**
 * Get the contact collection
 */
export async function getContactCollection() {
  return getCollection<ContactDocument>(COLLECTIONS.CONTACT);
}

/**
 * Close the MongoDB connection
 * Should be called on application shutdown (not needed in serverless)
 */
export async function closeConnection(): Promise<void> {
  if (cachedConnection) {
    console.log('[MongoDB] Closing database connection...');
    await cachedConnection.client.close();
    cachedConnection = null;
    console.log('[MongoDB] ✓ Connection closed');
  }
}

/**
 * Health check for MongoDB connection
 * Note: This function reuses the cached connection from connectToDatabase()
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    await db.admin().ping();
    console.log('[MongoDB] ✓ Connection health check passed');
    return true;
  } catch (error) {
    console.error('[MongoDB] ❌ Connection health check failed:', error);
    return false;
  }
}
