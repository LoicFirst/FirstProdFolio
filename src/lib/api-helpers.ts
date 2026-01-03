import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * Helper to check authentication for API routes
 * Returns the session if authenticated, or an error response
 */
export async function requireAuth() {
  console.log('[API] Checking authentication...');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error('[API] Unauthorized access attempt - no session found');
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Please log in to access this resource' },
          { status: 401 }
        ),
        session: null,
      };
    }
    
    console.log('[API] ✓ Authenticated user:', session.user?.email);
    return { error: null, session };
  } catch (error) {
    console.error('[API] Error checking authentication:', error);
    return {
      error: NextResponse.json(
        { error: 'Authentication check failed' },
        { status: 500 }
      ),
      session: null,
    };
  }
}

/**
 * Helper to handle errors consistently across API routes
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`[API] Error in ${context}:`, error);
  
  if (error instanceof Error) {
    console.error(`[API] Error message:`, error.message);
    console.error(`[API] Error name:`, error.name);
    
    // Only log stack traces in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(`[API] Error stack:`, error.stack);
    }
    
    // MongoDB-specific errors
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      console.error('[API] MongoDB server error detected');
      return NextResponse.json(
        { error: 'Database operation failed. Please try again.' },
        { status: 503 }
      );
    }
    
    if (error.name === 'MongoNetworkError' || error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.error('[API] MongoDB network error detected');
      return NextResponse.json(
        { error: 'Database connection error. Please check your connection and try again.' },
        { status: 503 }
      );
    }
    
    if (error.message.includes('authentication failed') || error.message.includes('auth failed')) {
      console.error('[API] MongoDB authentication error detected');
      return NextResponse.json(
        { error: 'Database authentication failed. Please contact support.' },
        { status: 503 }
      );
    }
    
    // Mongoose-specific errors
    if (error.name === 'ValidationError' || error.message.includes('validation failed')) {
      console.error('[API] Mongoose validation error');
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    if (error.name === 'CastError' || error.message.includes('Cast to ObjectId failed')) {
      console.error('[API] Invalid ObjectId format');
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    if (error.message.includes('duplicate key')) {
      console.error('[API] Duplicate key error');
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error', context },
    { status: 500 }
  );
}

/**
 * Helper to log API request
 */
export function logApiRequest(method: string, path: string, userId?: string) {
  console.log(`[API] ${method} ${path}`, userId ? `by user ID: ${userId}` : '');
}

/**
 * Helper to mask email addresses in logs for security
 * Returns first character + *** + @ + domain
 * Returns '***' if email is invalid/malformed
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email || typeof email !== 'string') {
    return '***';
  }
  
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return '***';
  }
  
  return parts[0].charAt(0) + '***@' + parts[1];
}
