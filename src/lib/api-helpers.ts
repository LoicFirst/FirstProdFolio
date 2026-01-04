import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/jwt';
import { isFilesystemError, type FilesystemError } from '@/lib/filesystem';
import { API_ERROR_MESSAGES } from '@/lib/error-messages';

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
        API_ERROR_MESSAGES.UNAUTHORIZED,
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
        API_ERROR_MESSAGES.AUTH_CHECK_FAILED,
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
    
    // Check for filesystem errors (read-only environment)
    if (isFilesystemError(error)) {
      const fsError = error as FilesystemError;
      
      if (fsError.isReadOnly || fsError.code === 'EROFS') {
        console.error(`[API] ❌ READ-ONLY FILESYSTEM DETECTED`);
        console.error(`[API] This is common in serverless environments like Vercel`);
        console.error(`[API] Help:`, fsError.helpMessage);
        return NextResponse.json(
          { 
            ...API_ERROR_MESSAGES.READ_ONLY_FILESYSTEM,
            isReadOnly: true
          },
          { status: 500 }
        );
      }
      
      // Check for file not found errors
      if (fsError.code === 'ENOENT') {
        console.error(`[API] ❌ FILE NOT FOUND`);
        return NextResponse.json(
          { 
            ...API_ERROR_MESSAGES.FILE_NOT_FOUND,
            details: fsError.helpMessage || API_ERROR_MESSAGES.FILE_NOT_FOUND.details,
            code: 'ENOENT'
          },
          { status: 500 }
        );
      }
      
      // Check for permission errors
      if (fsError.code === 'EACCES') {
        console.error(`[API] ❌ PERMISSION DENIED`);
        return NextResponse.json(
          { 
            ...API_ERROR_MESSAGES.PERMISSION_DENIED,
            details: fsError.helpMessage || API_ERROR_MESSAGES.PERMISSION_DENIED.details,
            code: 'EACCES'
          },
          { status: 500 }
        );
      }
      
      // Check for invalid JSON
      if (fsError.code === 'INVALID_JSON') {
        console.error(`[API] ❌ INVALID JSON`);
        return NextResponse.json(
          { 
            ...API_ERROR_MESSAGES.INVALID_JSON,
            details: fsError.helpMessage || API_ERROR_MESSAGES.INVALID_JSON.details,
            code: 'INVALID_JSON'
          },
          { status: 500 }
        );
      }
    }
    
    // Check for specific error types (legacy MongoDB errors, kept for compatibility)
    if (error.message.includes('Cast to ObjectId failed')) {
      return NextResponse.json(
        API_ERROR_MESSAGES.INVALID_ID,
        { status: 400 }
      );
    }
    
    if (error.message.includes('duplicate key')) {
      return NextResponse.json(
        API_ERROR_MESSAGES.RESOURCE_EXISTS,
        { status: 409 }
      );
    }
    
    if (error.message.includes('validation failed')) {
      return NextResponse.json(
        { ...API_ERROR_MESSAGES.VALIDATION_FAILED, details: error.message },
        { status: 400 }
      );
    }
  }
  
  return NextResponse.json(
    { ...API_ERROR_MESSAGES.INTERNAL_ERROR, context },
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
