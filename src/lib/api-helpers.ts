import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/jwt';

/**
 * Helper to check authentication for API routes using JWT
 * Returns the authenticated email if successful, or an error response
 * 
 * Note: Requires NextRequest to be passed as parameter now
 * Legacy signature kept for compatibility but should pass request parameter
 */
export async function requireAuth(request?: NextRequest) {
  console.log('[API] Checking authentication...');
  
  // Handle legacy calls without request parameter
  if (!request) {
    console.error('[API] Unauthorized - No request object provided for JWT authentication');
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Please provide authentication token' },
        { status: 401 }
      ),
      session: null,
    };
  }
  
  try {
    const auth = authenticateRequest(request);
    
    if (!auth.authenticated) {
      console.error('[API] Unauthorized access attempt - invalid or missing token');
      return {
        error: auth.error,
        session: null,
      };
    }
    
    console.log('[API] ✓ Authenticated user:', auth.email);
    return { 
      error: null, 
      session: { email: auth.email } 
    };
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
    
    // Only log stack traces in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(`[API] Error stack:`, error.stack);
    }
    
    // Check for specific error types
    if (error.message.includes('Cast to ObjectId failed')) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    if (error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
    
    if (error.message.includes('validation failed')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
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
