import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { AuroraDSQLClient } from '@aws/aurora-dsql-node-postgres-connector';

/**
 * Aurora DSQL (PostgreSQL) connection utility for portfolio data storage
 * 
 * This module handles the connection to Amazon Aurora DSQL and provides access
 * to the PostgreSQL database for storing portfolio data (about, photos, videos, contact info).
 * 
 * Environment variables required:
 * - AWS_REGION: AWS region (e.g., us-east-1)
 * - AWS_ROLE_ARN: IAM role ARN for OIDC authentication
 * - PGHOST: Aurora DSQL cluster endpoint
 * - PGPORT: PostgreSQL port (usually 5432)
 * - PGUSER: Database user (usually 'admin')
 * - PGDATABASE: Database name (usually 'postgres')
 * - PGSSLMODE: SSL mode (should be 'require')
 */

// Check required environment variables
const REQUIRED_ENV_VARS = [
  'AWS_REGION',
  'PGHOST',
  'PGUSER',
  'PGDATABASE',
  'PGPORT',
  'PGSSLMODE'
];

const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(
    '[Aurora] WARNING: Missing required environment variables: ' +
    missingVars.join(', ') +
    '. Database operations will fail. This is expected during build time. ' +
    'Set these variables in your .env.local file for local development, ' +
    'or in Vercel Environment Variables for production.'
  );
}

// Table names
export const TABLES = {
  ABOUT: 'about',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  CONTACT: 'contact',
  REVIEWS: 'reviews',
  SETTINGS: 'settings',
} as const;

// Global connection pool cache for serverless environments
let cachedPool: Pool | null = null;

/**
 * Create or get the cached Aurora DSQL connection pool
 * This function reuses the pool in serverless environments
 */
export function getAuroraPool(): Pool {
  // Return cached pool if available
  if (cachedPool) {
    console.log('[Aurora] Using cached connection pool');
    return cachedPool;
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('[Aurora] Creating new connection pool...');

  try {
    // Configure pool with Aurora DSQL settings
    const poolConfig: PoolConfig = {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: true } : false,
      max: 10, // Maximum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return error if connection takes > 10 seconds
    };

    // Check if we're in Vercel environment or using Aurora DSQL
    if (process.env.PGHOST && process.env.PGHOST.includes('dsql')) {
      console.log('[Aurora] Configuring with Aurora DSQL Client for IAM authentication');
      
      // Use AuroraDSQLClient which automatically handles IAM auth
      // It will use AWS credentials from environment (including OIDC-sourced ones)
      const client = new AuroraDSQLClient({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        ssl: true,
      }) as any; // AuroraDSQLClient extends Pool

      cachedPool = client;
    } else {
      console.log('[Aurora] Configuring with standard PostgreSQL Pool');
      
      // Use standard Pool for non-DSQL PostgreSQL
      cachedPool = new Pool(poolConfig);
    }

    if (!cachedPool) {
      throw new Error('Failed to create connection pool');
    }
    
    console.log('[Aurora] ✓ Connection pool created successfully');
    
    // Handle pool errors
    cachedPool.on('error', (err) => {
      console.error('[Aurora] Unexpected pool error:', err);
    });

    return cachedPool;
  } catch (error) {
    console.error('[Aurora] ❌ Failed to create connection pool:', error);
    throw new Error(`Failed to create Aurora connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a query on the Aurora DSQL database
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getAuroraPool();
  
  try {
    console.log('[Aurora] Executing query:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    const result = await pool.query<T>(text, params);
    console.log('[Aurora] ✓ Query executed successfully, rows:', result.rowCount);
    return result;
  } catch (error) {
    console.error('[Aurora] ❌ Query failed:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  const pool = getAuroraPool();
  return pool.connect();
}

/**
 * Health check for Aurora DSQL connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health_check');
    console.log('[Aurora] ✓ Connection health check passed');
    return result.rows.length > 0;
  } catch (error) {
    console.error('[Aurora] ❌ Connection health check failed:', error);
    return false;
  }
}

/**
 * Close the connection pool
 * Should be called on application shutdown (not needed in serverless)
 */
export async function closePool(): Promise<void> {
  if (cachedPool) {
    console.log('[Aurora] Closing connection pool...');
    await cachedPool.end();
    cachedPool = null;
    console.log('[Aurora] ✓ Connection pool closed');
  }
}

/**
 * Initialize the database schema
 * This should be run during deployment or first-time setup
 */
export async function initializeSchema(): Promise<void> {
  console.log('[Aurora] Initializing database schema...');
  
  // Note: For Aurora DSQL, schema initialization should be done via AWS CLI or console
  // This function is a placeholder for future enhancements
  
  console.log('[Aurora] ⚠️  Schema initialization should be done manually using init-aurora-schema.sql');
  console.log('[Aurora] See documentation for setup instructions');
}
