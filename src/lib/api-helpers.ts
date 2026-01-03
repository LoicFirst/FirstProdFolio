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
    console.error(`[API] Error stack:`, error.stack);
    
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
  console.log(`[API] ${method} ${path}`, userId ? `by user: ${userId}` : '');
}
