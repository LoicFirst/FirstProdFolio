import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

// Ensure NEXTAUTH_SECRET is set in production
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.error('NEXTAUTH_SECRET is not set. Authentication will not work properly.');
}

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
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin';

  // If admin credentials are not configured in environment variables, skip
  if (!adminEmail || !adminPassword) {
    return;
  }

  // Validate password meets minimum requirements (8 characters as per User model)
  if (adminPassword.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters');
    return;
  }

  try {
    // Check if any admin user exists (search by role to stay consistent with seed endpoint)
    const existingAdmin = await User.findOne({ role: 'admin' }).select('+password');
    
    if (!existingAdmin) {
      // Create new admin user with credentials from environment variables
      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
      });
      console.log('Admin user created from environment variables');
    } else {
      // Check if email, password, or name needs to be updated
      // comparePassword compares plain text password against bcrypt hash stored in DB
      const emailNeedsUpdate = existingAdmin.email !== adminEmail;
      const nameNeedsUpdate = existingAdmin.name !== adminName;
      const passwordMatches = await existingAdmin.comparePassword(adminPassword);
      
      if (emailNeedsUpdate || nameNeedsUpdate || !passwordMatches) {
        existingAdmin.email = adminEmail;
        existingAdmin.name = adminName;
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('Admin user credentials updated from environment variables');
      }
    }
    
    // Mark as ensured to skip checks in subsequent authentication attempts
    adminUserEnsured = true;
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    // Don't throw - allow authentication to continue with existing database state
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await dbConnect();

          // Ensure admin user exists and is synced with environment variables
          await ensureAdminUser();

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const isMatch = await user.comparePassword(credentials.password);

          if (!isMatch) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
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
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
};
