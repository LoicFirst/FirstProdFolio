import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global declaration for mongoose connection cache.
 * We use `var` here because Next.js hot-reloads in development mode cause
 * the module to be re-evaluated, which would create new connections.
 * By storing the connection in `global`, we persist it across hot-reloads.
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is not defined. Please configure it in your .env file or deployment settings.';
    console.error('[DB] CRITICAL:', errorMsg);
    throw new Error(errorMsg);
  }

  // Return cached connection if it exists and is ready
  if (cached.conn) {
    console.log('[DB] Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[DB] Creating new database connection...');
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for initial connection
      socketTimeoutMS: 45000, // 45 seconds for socket timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('[DB] ✓ Database connection established successfully');
        console.log('[DB] Connected to database:', mongoose.connection.name);
        return mongoose;
      })
      .catch((error) => {
        console.error('[DB] Failed to connect to database:', error);
        if (error instanceof Error) {
          console.error('[DB] Error message:', error.message);
          console.error('[DB] Error name:', error.name);
        }
        // Clear the promise so it can be retried
        cached.promise = null;
        throw error;
      });
  }

  try {
    console.log('[DB] Waiting for database connection...');
    cached.conn = await cached.promise;
    console.log('[DB] ✓ Database connection ready');
  } catch (e) {
    console.error('[DB] Error establishing database connection:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Add connection event listeners for better debugging
if (mongoose.connection) {
  mongoose.connection.on('connected', () => {
    console.log('[DB] Mongoose connected to database');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[DB] Mongoose disconnected from database');
  });
}

export default dbConnect;
