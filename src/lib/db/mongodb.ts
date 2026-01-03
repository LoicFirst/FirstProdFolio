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

/**
 * Validates the MongoDB URI format
 * @param uri The MongoDB connection URI to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateMongoDBUri(uri: string): { isValid: boolean; error?: string } {
  // Check if URI is empty or just whitespace
  if (!uri || uri.trim().length === 0) {
    return {
      isValid: false,
      error: 'MONGODB_URI is empty or contains only whitespace'
    };
  }

  const MONGODB_PROTOCOL_REGEX = /^mongodb(\+srv)?:\/\//;

  // Check for basic MongoDB URI format (mongodb:// or mongodb+srv://)
  if (!MONGODB_PROTOCOL_REGEX.test(uri)) {
    return {
      isValid: false,
      error: 'MONGODB_URI must start with "mongodb://" or "mongodb+srv://"'
    };
  }

  // Check for presence of credentials pattern (user:password@)
  // More robust check: look for @ and ensure credentials pattern before it
  const parts = uri.split('@');
  const hasCredentials = parts.length > 1;
  
  if (hasCredentials) {
    // Extract the part before the last @ to check credentials format
    // Use lastIndexOf to handle edge cases with multiple @ symbols
    const lastAtIndex = uri.lastIndexOf('@');
    const credentialsPart = uri.substring(0, lastAtIndex);
    const protocolRemoved = credentialsPart.replace(MONGODB_PROTOCOL_REGEX, '');
    
    // Check if credentials contain a colon (separating user and password)
    if (!protocolRemoved.includes(':')) {
      return {
        isValid: false,
        error: 'MONGODB_URI credentials format is invalid. Expected format: mongodb+srv://username:password@host'
      };
    }

    // Check for placeholder password patterns
    if (protocolRemoved.includes('<') || protocolRemoved.includes('>')) {
      return {
        isValid: false,
        error: 'MONGODB_URI contains placeholder password (e.g., <password>). Replace it with the actual password.'
      };
    }
    
    // Check for host presence after credentials (everything after the last @)
    const hostPart = uri.substring(lastAtIndex + 1);
    if (!hostPart || hostPart.trim().length === 0) {
      return {
        isValid: false,
        error: 'MONGODB_URI is missing the host/cluster address after credentials'
      };
    }
  } else {
    // No credentials, check if there's a host after the protocol
    const withoutProtocol = uri.replace(MONGODB_PROTOCOL_REGEX, '');
    if (!withoutProtocol || withoutProtocol.trim().length === 0) {
      return {
        isValid: false,
        error: 'MONGODB_URI is missing the host/cluster address'
      };
    }
  }

  return { isValid: true };
}

async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is not defined. Please configure it in your .env file or deployment settings.';
    console.error('[DB] CRITICAL:', errorMsg);
    throw new Error(errorMsg);
  }

  // Validate MongoDB URI format before attempting connection
  console.log('[DB] Validating MongoDB URI format...');
  const validation = validateMongoDBUri(MONGODB_URI);
  if (!validation.isValid) {
    const errorMsg = `MONGODB_URI validation failed: ${validation.error}`;
    console.error('[DB] CRITICAL:', errorMsg);
    console.error('[DB] Please check your MONGODB_URI in the environment variables.');
    console.error('[DB] Expected format: mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName');
    throw new Error(errorMsg);
  }
  console.log('[DB] ✓ MongoDB URI format is valid');

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
      retryWrites: true, // Retry write operations that fail due to transient errors
      retryReads: true, // Retry read operations that fail due to transient errors
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('[DB] ✓ Database connection established successfully');
        console.log('[DB] Connected to database:', mongoose.connection.name);
        return mongoose;
      })
      .catch((error) => {
        console.error('[DB] Failed to connect to database:', error);
        
        // Clear the promise so it can be retried
        cached.promise = null;
        
        // Provide specific error messages based on error type
        if (error instanceof Error) {
          console.error('[DB] Error message:', error.message);
          console.error('[DB] Error name:', error.name);
          
          // Categorize the error for better user feedback
          let userFriendlyMessage = error.message;
          
          if (error.message.includes('authentication failed') || error.message.includes('auth failed')) {
            userFriendlyMessage = 'MongoDB authentication failed. Please verify username and password in MONGODB_URI.';
            console.error('[DB] Authentication error detected. Check credentials in MONGODB_URI.');
          } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            userFriendlyMessage = 'MongoDB host not found. Please verify the cluster address in MONGODB_URI.';
            console.error('[DB] DNS/Host resolution error. Check the cluster address in MONGODB_URI.');
          } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
            userFriendlyMessage = 'MongoDB connection timed out. Check network connectivity and MongoDB Atlas IP whitelist.';
            console.error('[DB] Connection timeout. Verify network access and IP whitelist in MongoDB Atlas.');
          } else if (error.message.includes('Invalid connection string') || error.message.includes('URI')) {
            userFriendlyMessage = 'Invalid MongoDB connection string format. Please check MONGODB_URI syntax.';
            console.error('[DB] Connection string format error. Review MONGODB_URI syntax.');
          } else if (error.name === 'MongoServerSelectionError') {
            userFriendlyMessage = 'Cannot reach MongoDB server. Check connection string, network access, and MongoDB Atlas settings.';
            console.error('[DB] Server selection failed. Verify MongoDB Atlas configuration and network settings.');
          }
          
          // Create enhanced error with user-friendly message
          const enhancedError = new Error(userFriendlyMessage);
          enhancedError.name = error.name;
          throw enhancedError;
        }
        
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
