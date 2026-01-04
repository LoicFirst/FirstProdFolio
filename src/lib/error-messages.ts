/**
 * Centralized error messages for API responses
 * Ensures consistency and easier localization if needed
 */

export const API_ERROR_MESSAGES = {
  // Filesystem errors
  READ_ONLY_FILESYSTEM: {
    error: 'Cannot save data: Filesystem is read-only',
    details: 'The filesystem is read-only in this environment (common in serverless deployments like Vercel). To enable data persistence in production, you need to configure a database or external storage service.',
    helpUrl: 'https://vercel.com/docs/storage',
  },
  FILE_NOT_FOUND: {
    error: 'Data file not found',
    details: 'Required data file is missing',
  },
  PERMISSION_DENIED: {
    error: 'Permission denied',
    details: 'Application does not have permission to access the file',
  },
  INVALID_JSON: {
    error: 'Invalid JSON in data file',
    details: 'The data file contains invalid JSON syntax',
  },
  
  // Validation errors
  INVALID_ID: {
    error: 'Invalid ID format',
  },
  RESOURCE_EXISTS: {
    error: 'Resource already exists',
  },
  VALIDATION_FAILED: {
    error: 'Validation error',
  },
  
  // Generic errors
  INTERNAL_ERROR: {
    error: 'Internal server error',
  },
  UNAUTHORIZED: {
    error: 'Unauthorized',
    details: 'Please provide a valid authentication token',
  },
  AUTH_CHECK_FAILED: {
    error: 'Authentication check failed',
  },
};

/**
 * French error messages for UI
 * Centralized to avoid duplication across admin pages
 */
export const UI_ERROR_MESSAGES_FR = {
  READ_ONLY_FILESYSTEM:
    '❌ Erreur: Système de fichiers en lecture seule\n\n' +
    'Le système de fichiers est en lecture seule dans cet environnement (courant pour les déploiements serverless comme Vercel).\n\n' +
    'Pour activer la persistance des données en production, vous devez configurer une base de données ou un service de stockage externe.\n\n' +
    'Documentation: https://vercel.com/docs/storage',
  
  SAVE_ERROR: (error: string, details?: string) =>
    `Erreur lors de l'enregistrement: ${error}\n${details || ''}`,
  
  SAVE_SUCCESS: 'Enregistré avec succès !',
  
  GENERAL_ERROR: 'Une erreur est survenue lors de l\'enregistrement',
};
