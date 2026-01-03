import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { maskEmail } from '@/lib/api-helpers';

// Ensure NEXTAUTH_SECRET is set in production
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.error('[AUTH] CRITICAL: NEXTAUTH_SECRET is not set. Authentication will not work properly.');
}

// Validate environment variables at startup
const validateEnvVars = () => {
  const required = ['NEXTAUTH_SECRET', 'MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('[AUTH] CRITICAL: Missing required environment variables:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      console.error('[AUTH] Application may not function correctly without these variables.');
    }
  } else {
    console.log('[AUTH] All required environment variables are configured');
  }
};

// Run validation on module load
validateEnvVars();

// Cache to track if admin user has been ensured in this process instance
let adminUserEnsured = false;

/**
 * Ensures the admin user exists in the database with the correct credentials
 * from environment variables. This is called during authentication to
 * automatically sync the admin user with environment variable settings.
 * Uses a process-level cache to avoid checking on every authentication attempt.
 */
async function ensureAdminUser(): Promise<void> {
  // Skip if already ensured in this process instance
  if (adminUserEnsured) {
    console.log('[AUTH] Admin user already ensured in this process');
    return;
  }

  console.log('[AUTH] Starting admin user synchronization...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin';

  // If admin credentials are not configured in environment variables, skip
  if (!adminEmail || !adminPassword) {
    console.error('[AUTH] Admin credentials not configured in environment variables (ADMIN_EMAIL or ADMIN_PASSWORD missing)');
    return;
  }

  // Validate password meets minimum requirements (8 characters as per User model)
  if (adminPassword.length < 8) {
    console.error('[AUTH] ADMIN_PASSWORD must be at least 8 characters. Current length:', adminPassword.length);
    return;
  }

  console.log('[AUTH] Admin credentials validated. Email:', maskEmail(adminEmail));

  try {
    // Check if any admin user exists (search by role to stay consistent with seed endpoint)
    console.log('[AUTH] Checking for existing admin user...');
    const existingAdmin = await User.findOne({ role: 'admin' }).select('+password');
    
    if (!existingAdmin) {
      // Create new admin user with credentials from environment variables
      console.log('[AUTH] No admin user found. Creating new admin user...');
      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
      });
      console.log('[AUTH] ✓ Admin user created successfully from environment variables');
      // Mark as ensured only after successful creation
      adminUserEnsured = true;
    } else {
      console.log('[AUTH] Admin user found. Checking if update is needed...');
      // Check if email, password, or name needs to be updated
      // comparePassword compares plain text password against bcrypt hash stored in DB
      const emailNeedsUpdate = existingAdmin.email !== adminEmail;
      const nameNeedsUpdate = existingAdmin.name !== adminName;
      const passwordMatches = await existingAdmin.comparePassword(adminPassword);
      
      if (emailNeedsUpdate || nameNeedsUpdate || !passwordMatches) {
        console.log('[AUTH] Admin user needs update. Email changed:', emailNeedsUpdate, 'Name changed:', nameNeedsUpdate, 'Password changed:', !passwordMatches);
        existingAdmin.email = adminEmail;
        existingAdmin.name = adminName;
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('[AUTH] ✓ Admin user credentials updated from environment variables');
      } else {
        console.log('[AUTH] ✓ Admin user credentials are up to date');
      }
      // Mark as ensured after successful check/update
      adminUserEnsured = true;
    }
  } catch (error) {
    console.error('[AUTH] ERROR: Failed to ensure admin user:', error);
    if (error instanceof Error) {
      console.error('[AUTH] Error message:', error.message);
      // Only log stack trace in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[AUTH] Error stack:', error.stack);
      }
    }
    // Don't set adminUserEnsured to true on error - allow retry on next attempt
    // Don't re-throw to prevent auth failures from crashing the app
    // Note: The authorize function will still work with existing users even if sync fails
    console.warn('[AUTH] WARNING: Admin user synchronization failed. Authentication will continue with existing users only.');
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorization attempt started');
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Missing credentials - email or password not provided');
          throw new Error('Email and password are required');
        }

        console.log('[AUTH] Credentials provided. Email:', maskEmail(credentials.email));

        try {
          console.log('[AUTH] Attempting database connection...');
          await dbConnect();
          console.log('[AUTH] ✓ Database connected successfully');

          // Ensure admin user exists and is synced with environment variables
          console.log('[AUTH] Ensuring admin user exists...');
          await ensureAdminUser();
          console.log('[AUTH] ✓ Admin user check complete');

          console.log('[AUTH] Looking up user by email');
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            console.error('[AUTH] User not found');
            throw new Error('Invalid credentials');
          }

          console.log('[AUTH] User found. Verifying password...');
          const isMatch = await user.comparePassword(credentials.password);

          if (!isMatch) {
            console.error('[AUTH] Password verification failed');
            throw new Error('Invalid credentials');
          }

          console.log('[AUTH] ✓ Password verified successfully');
          console.log('[AUTH] ✓ Authentication successful');

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('[AUTH] Authentication error occurred:', error);
          if (error instanceof Error) {
            console.error('[AUTH] Error message:', error.message);
            // Only log stack trace in development
            if (process.env.NODE_ENV === 'development') {
              console.error('[AUTH] Error stack:', error.stack);
            }
          }
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('[AUTH] JWT callback - creating token for user:', maskEmail(user.email));
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('[AUTH] Session callback - creating session for user:', maskEmail(session.user.email));
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Only enable debug mode in development with explicit flag
  debug: process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_DEBUG === 'true',
};
