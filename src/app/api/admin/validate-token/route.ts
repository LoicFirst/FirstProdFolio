import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/jwt';

/**
 * POST - Validate JWT token
 * Returns whether the token is valid and user info if valid
 */
export async function POST(request: NextRequest) {
  console.log('[AUTH] POST /api/admin/validate-token - Validating token');
  
  try {
    const auth = authenticateRequest(request);
    
    if (!auth.authenticated) {
      console.error('[AUTH] Token validation failed');
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    console.log('[AUTH] ✓ Token is valid for user:', auth.email);
    return NextResponse.json({
      valid: true,
      email: auth.email,
    });
  } catch (error) {
    console.error('[AUTH] Error validating token:', error);
    return NextResponse.json(
      { valid: false, error: 'Token validation failed' },
      { status: 500 }
    );
  }
}
