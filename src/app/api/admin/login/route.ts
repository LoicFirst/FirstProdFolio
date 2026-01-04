import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdmin } from '@/lib/db/json-db';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  console.log('[AUTH] ========================================');
  console.log('[AUTH] Admin login attempt started');
  console.log('[AUTH] Timestamp:', new Date().toISOString());
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[AUTH] ERROR: Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    // Validate input presence
    if (!email || !password) {
      console.error('[AUTH] ERROR: Missing credentials');
      console.error('[AUTH] Email provided:', !!email);
      console.error('[AUTH] Password provided:', !!password);
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }
    
    console.log('[AUTH] Credentials received');
    console.log('[AUTH] Email length:', email.length);
    console.log('[AUTH] Password length:', password.length);
    console.log('[AUTH] Validating credentials for email:', email);
    
    // Get admin credentials from JSON file
    let admin;
    try {
      admin = getAdmin();
      console.log('[AUTH] ✓ Successfully loaded admin data from JSON file');
      console.log('[AUTH] Stored admin email:', admin.email);
      console.log('[AUTH] Stored password hash exists:', !!admin.password);
      console.log('[AUTH] Stored password hash length:', admin.password?.length || 0);
    } catch (dbError) {
      console.error('[AUTH] CRITICAL ERROR: Failed to read admin data from JSON file');
      console.error('[AUTH] Error details:', dbError);
      console.error('[AUTH] Make sure data.json exists and is properly formatted');
      return NextResponse.json(
        { error: 'Erreur serveur: Impossible de lire les données d\'administration. Vérifiez que data.json existe.' },
        { status: 500 }
      );
    }
    
    // Validate that admin data is properly structured
    if (!admin || !admin.email || !admin.password) {
      console.error('[AUTH] CRITICAL ERROR: Admin data is incomplete or malformed');
      console.error('[AUTH] Admin object exists:', !!admin);
      console.error('[AUTH] Admin email exists:', !!admin?.email);
      console.error('[AUTH] Admin password exists:', !!admin?.password);
      return NextResponse.json(
        { error: 'Erreur serveur: Configuration d\'administration invalide' },
        { status: 500 }
      );
    }
    
    // Check email match
    console.log('[AUTH] Comparing emails...');
    console.log('[AUTH] Provided email:', email);
    console.log('[AUTH] Expected email:', admin.email);
    console.log('[AUTH] Emails match:', email === admin.email);
    
    if (email !== admin.email) {
      console.warn('[AUTH] ⚠️  Authentication failed: Email does not match');
      console.warn('[AUTH] Expected:', admin.email);
      console.warn('[AUTH] Received:', email);
      return NextResponse.json(
        { error: 'Identifiant incorrect' },
        { status: 401 }
      );
    }
    
    console.log('[AUTH] ✓ Email matches');
    
    // Verify password
    console.log('[AUTH] Verifying password with bcrypt...');
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('[AUTH] Password verification completed');
      console.log('[AUTH] Password valid:', isPasswordValid);
    } catch (bcryptError) {
      console.error('[AUTH] ERROR: Bcrypt comparison failed');
      console.error('[AUTH] Error details:', bcryptError);
      return NextResponse.json(
        { error: 'Erreur serveur lors de la validation du mot de passe' },
        { status: 500 }
      );
    }
    
    if (!isPasswordValid) {
      console.warn('[AUTH] ⚠️  Authentication failed: Invalid password');
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    console.log('[AUTH] ✓ Password verified successfully');
    
    // Generate JWT token
    console.log('[AUTH] Generating JWT token...');
    let token;
    try {
      token = generateToken(admin.email);
      console.log('[AUTH] ✓ JWT token generated successfully');
      console.log('[AUTH] Token length:', token.length);
    } catch (jwtError) {
      console.error('[AUTH] ERROR: Failed to generate JWT token');
      console.error('[AUTH] Error details:', jwtError);
      return NextResponse.json(
        { error: 'Erreur serveur lors de la génération du jeton d\'authentification' },
        { status: 500 }
      );
    }
    
    console.log('[AUTH] ========================================');
    console.log('[AUTH] ✅ LOGIN SUCCESSFUL');
    console.log('[AUTH] User:', admin.email);
    console.log('[AUTH] ========================================');
    
    return NextResponse.json({
      success: true,
      token,
      email: admin.email,
    });
  } catch (error) {
    console.error('[AUTH] ========================================');
    console.error('[AUTH] ❌ UNEXPECTED ERROR DURING LOGIN');
    console.error('[AUTH] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[AUTH] Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('[AUTH] Stack trace:', error.stack);
    }
    console.error('[AUTH] ========================================');
    
    return NextResponse.json(
      { error: 'Erreur serveur interne. Consultez les logs du serveur pour plus de détails.' },
      { status: 500 }
    );
  }
}
