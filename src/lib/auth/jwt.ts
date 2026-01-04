import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[JWT] CRITICAL: JWT_SECRET environment variable is not set');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    // For development, use a fallback but warn
    console.warn('[JWT] Using fallback secret for development. DO NOT use in production!');
    return 'development-secret-change-in-production';
  }
  return secret;
}

export interface JWTPayload {
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(email: string): string {
  const JWT_SECRET = getJWTSecret();
  return jwt.sign(
    { email },
    JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  const JWT_SECRET = getJWTSecret();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer' && parts[1].length > 0) {
    return parts[1];
  }
  
  return null;
}

/**
 * Middleware to protect routes with JWT authentication
 */
export function authenticateRequest(request: NextRequest): { authenticated: boolean; email?: string; error?: NextResponse } {
  const token = extractToken(request);
  
  if (!token) {
    console.error('[JWT] No token provided');
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      ),
    };
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    console.error('[JWT] Invalid or expired token');
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      ),
    };
  }
  
  console.log('[JWT] ✓ Token verified for user:', payload.email);
  return {
    authenticated: true,
    email: payload.email,
  };
}
