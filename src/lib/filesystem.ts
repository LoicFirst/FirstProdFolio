import fs from 'fs';
import path from 'path';

/**
 * Filesystem helper module for handling read/write operations
 * with proper error handling for read-only environments (like Vercel serverless)
 */

export interface FilesystemError extends Error {
  code?: string;
  isReadOnly?: boolean;
  helpMessage?: string;
}

// Centralized error messages
const ERROR_MESSAGES = {
  READ_ONLY_FILESYSTEM: 
    'The filesystem is read-only (common in serverless environments like Vercel). ' +
    'To persist data in production, you need to use a database or external storage service. ' +
    'Local development works fine, but production deployments require persistent storage.',
  MISSING_FILE: 'Please ensure the file is present in your deployment.',
  INVALID_JSON: 'The file contains invalid JSON syntax. Please check for missing commas, quotes, or brackets.',
  PERMISSION_DENIED: 'The application does not have permission to access this file or directory.',
  DIRECTORY_NOT_FOUND: 'The parent directory does not exist. Please ensure the directory structure is correct.',
};

// Cache writability status to avoid repeated checks
const cachedWritabilityStatus = new Map<string, { writable: boolean; timestamp: number }>();
const CACHE_DURATION_MS = 60000; // Cache for 1 minute

/**
 * Check if the filesystem is writable
 * Returns true if we can write to the given directory, false otherwise
 * Results are cached for 1 minute to avoid repeated disk I/O
 */
export function isFilesystemWritable(testPath: string = process.cwd()): boolean {
  // Check cache first
  const cached = cachedWritabilityStatus.get(testPath);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
    return cached.writable;
  }
  
  try {
    // Use crypto for better uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const testFile = path.join(testPath, `.write-test-${process.pid}-${now}-${randomSuffix}`);
    fs.writeFileSync(testFile, 'test', 'utf-8');
    fs.unlinkSync(testFile);
    
    // Cache the result
    cachedWritabilityStatus.set(testPath, { writable: true, timestamp: now });
    return true;
  } catch (error) {
    console.warn('[FILESYSTEM] Filesystem is read-only:', testPath);
    
    // Cache the result
    cachedWritabilityStatus.set(testPath, { writable: false, timestamp: now });
    return false;
  }
}

/**
 * Create a filesystem error for read-only filesystem
 */
function createReadOnlyError(): FilesystemError {
  const error: FilesystemError = new Error('Filesystem is read-only');
  error.code = 'EROFS';
  error.isReadOnly = true;
  error.helpMessage = ERROR_MESSAGES.READ_ONLY_FILESYSTEM;
  return error;
}

/**
 * Safely read a JSON file with proper error handling
 */
export function readJSONFile<T>(filePath: string): T {
  console.log('[FILESYSTEM] Reading file:', filePath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      const error: FilesystemError = new Error(`File not found: ${filePath}`);
      error.code = 'ENOENT';
      error.helpMessage = `The file ${path.basename(filePath)} does not exist. ${ERROR_MESSAGES.MISSING_FILE}`;
      throw error;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log('[FILESYSTEM] ✓ File read successfully, size:', content.length, 'bytes');
    
    const data = JSON.parse(content);
    console.log('[FILESYSTEM] ✓ JSON parsed successfully');
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const fsError: FilesystemError = new Error(`Invalid JSON in file: ${filePath}`);
      fsError.code = 'INVALID_JSON';
      fsError.helpMessage = ERROR_MESSAGES.INVALID_JSON;
      console.error('[FILESYSTEM] ❌ JSON parsing error:', fsError.message);
      throw fsError;
    }
    
    if (error instanceof Error && 'code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'EACCES') {
        const fsError: FilesystemError = new Error(`Permission denied reading file: ${filePath}`);
        fsError.code = 'EACCES';
        fsError.helpMessage = ERROR_MESSAGES.PERMISSION_DENIED;
        console.error('[FILESYSTEM] ❌ Permission error:', fsError.message);
        throw fsError;
      }
    }
    
    console.error('[FILESYSTEM] ❌ Error reading file:', error);
    throw error;
  }
}

/**
 * Safely write a JSON file with proper error handling
 * Includes detection of read-only filesystem (common in serverless environments)
 * Note: Writability is checked and cached to minimize disk I/O
 */
export function writeJSONFile<T>(filePath: string, data: T): void {
  console.log('[FILESYSTEM] Writing file:', filePath);
  
  try {
    const dir = path.dirname(filePath);
    
    // Check if directory is writable (cached)
    if (!isFilesystemWritable(dir)) {
      console.error('[FILESYSTEM] ❌ Read-only filesystem error');
      throw createReadOnlyError();
    }
    
    // Write the file
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log('[FILESYSTEM] ✓ File written successfully, size:', jsonContent.length, 'bytes');
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (isFilesystemError(error) && error.isReadOnly) {
      throw error;
    }
    
    // Handle other Node.js filesystem errors
    if (error instanceof Error && 'code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      
      if (nodeError.code === 'EACCES') {
        const fsError: FilesystemError = new Error(`Permission denied writing to file: ${filePath}`);
        fsError.code = 'EACCES';
        fsError.helpMessage = ERROR_MESSAGES.PERMISSION_DENIED;
        console.error('[FILESYSTEM] ❌ Permission error:', fsError.message);
        throw fsError;
      }
      
      if (nodeError.code === 'EROFS') {
        console.error('[FILESYSTEM] ❌ Read-only filesystem error');
        throw createReadOnlyError();
      }
      
      if (nodeError.code === 'ENOENT') {
        const fsError: FilesystemError = new Error(`Directory not found: ${path.dirname(filePath)}`);
        fsError.code = 'ENOENT';
        fsError.helpMessage = ERROR_MESSAGES.DIRECTORY_NOT_FOUND;
        console.error('[FILESYSTEM] ❌ Directory not found:', fsError.message);
        throw fsError;
      }
    }
    
    console.error('[FILESYSTEM] ❌ Error writing file:', error);
    throw error;
  }
}

/**
 * Type guard to check if an error is a FilesystemError
 */
export function isFilesystemError(error: unknown): error is FilesystemError {
  return error instanceof Error && 
         ('code' in error || 'isReadOnly' in error || 'helpMessage' in error);
}

/**
 * Get information about filesystem writability and environment
 */
export function getFilesystemInfo(): {
  environment: string;
  isProduction: boolean;
  isWritable: boolean;
  cwdWritable: boolean;
  tmpWritable: boolean;
  warning?: string;
} {
  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';
  const cwdWritable = isFilesystemWritable(process.cwd());
  const tmpWritable = isFilesystemWritable('/tmp');
  
  const info = {
    environment,
    isProduction,
    isWritable: cwdWritable,
    cwdWritable,
    tmpWritable,
  };
  
  if (isProduction && !cwdWritable) {
    return {
      ...info,
      warning: 'Filesystem is read-only in production. Data persistence requires a database or external storage service.'
    };
  }
  
  return info;
}
