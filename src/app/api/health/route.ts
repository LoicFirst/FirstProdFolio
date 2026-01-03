import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

/**
 * Health check endpoint to verify system status and MongoDB connection
 * This endpoint can be used for monitoring and troubleshooting
 */
export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    database: {
      status: 'unknown',
      connected: false,
      responseTime: 0,
    },
    checks: {
      mongoUri: false,
      connection: false,
    },
  };

  try {
    // Check if MONGODB_URI is configured
    if (!process.env.MONGODB_URI) {
      health.status = 'unhealthy';
      health.database.status = 'misconfigured';
      health.checks.mongoUri = false;
      console.error('[HEALTH] MONGODB_URI not configured');
      
      return NextResponse.json(health, { status: 503 });
    }
    
    health.checks.mongoUri = true;

    // Attempt database connection
    const dbStartTime = Date.now();
    await dbConnect();
    const dbEndTime = Date.now();
    
    health.database.responseTime = dbEndTime - dbStartTime;
    health.database.connected = mongoose.connection.readyState === 1;
    health.database.status = health.database.connected ? 'connected' : 'disconnected';
    health.checks.connection = health.database.connected;
    
    if (!health.database.connected) {
      health.status = 'unhealthy';
      console.error('[HEALTH] Database not connected. ReadyState:', mongoose.connection.readyState);
      return NextResponse.json(health, { status: 503 });
    }

    // Connection successful
    console.log(`[HEALTH] ✓ Health check passed (${Date.now() - startTime}ms)`);
    return NextResponse.json(health, { status: 200 });
    
  } catch (error) {
    health.status = 'unhealthy';
    health.database.status = 'error';
    health.database.connected = false;
    health.checks.connection = false;
    
    console.error('[HEALTH] Health check failed:', error);
    
    if (error instanceof Error) {
      health.database.status = `error: ${error.message}`;
    }
    
    return NextResponse.json(health, { status: 503 });
  }
}
