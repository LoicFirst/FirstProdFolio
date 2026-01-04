import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface JWTPayload {
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(email: string): string {
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
  if (parts.length === 2 && parts[0] === 'Bearer') {
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
