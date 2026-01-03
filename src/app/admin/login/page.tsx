'use client';

import { useState, useEffect, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiLockClosed, HiMail, HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi';

// Helper to get initial error state from URL
function getInitialErrors(searchParams: URLSearchParams): { error: string; configError: string } {
  const urlError = searchParams.get('error');
  if (!urlError) return { error: '', configError: '' };
  
  if (urlError === 'Configuration') {
    return {
      error: '',
      configError: 'Erreur de configuration du serveur. Veuillez vérifier que les variables d\'environnement NEXTAUTH_SECRET, NEXTAUTH_URL et MONGODB_URI sont correctement configurées sur Vercel.',
    };
  } else if (urlError === 'CredentialsSignin') {
    return { error: 'Email ou mot de passe incorrect', configError: '' };
  } else {
    return { error: 'Une erreur est survenue lors de la connexion', configError: '' };
  }
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const initialErrors = useMemo(() => getInitialErrors(searchParams), [searchParams]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialErrors.error);
  const [configError, setConfigError] = useState(initialErrors.configError);
  const [loading, setLoading] = useState(false);
  const { status } = useSession();

  // Clear URL error params after reading them
  useEffect(() => {
    if (searchParams.get('error')) {
      window.history.replaceState({}, '', '/admin/login');
    }
  }, [searchParams]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/admin/dashboard';
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfigError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
      } else {
        // Use window.location for a full page navigation to ensure
        // the session is properly established before rendering the dashboard
        window.location.href = '/admin/dashboard';
      }
    } catch {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  // Show loading state while checking session or if already authenticated
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">
            {status === 'authenticated' ? 'Redirection...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiLockClosed className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-2">Connectez-vous pour gérer votre portfolio</p>
          </div>

          {/* Configuration Error */}
          {configError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <HiExclamationCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-500 text-sm font-medium mb-2">Erreur de configuration</p>
                  <p className="text-yellow-400/80 text-xs">{configError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="admin@loicmazagran.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Loic Mazagran. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  );
}
