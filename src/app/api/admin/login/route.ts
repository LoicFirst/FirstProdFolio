import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdmin } from '@/lib/db/json-db';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  console.log('[AUTH] Admin login attempt');
  
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      console.error('[AUTH] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('[AUTH] Validating credentials for:', email);
    
    // Get admin credentials from JSON file
    const admin = getAdmin();
    
    // Check email
    if (email !== admin.email) {
      console.error('[AUTH] Invalid email');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.error('[AUTH] Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken(admin.email);
    
    console.log('[AUTH] ✓ Login successful for:', email);
    
    return NextResponse.json({
      success: true,
      token,
      email: admin.email,
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
