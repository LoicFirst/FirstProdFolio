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

/**
 * Check if the filesystem is writable
 * Returns true if we can write to the given directory, false otherwise
 */
export function isFilesystemWritable(testPath: string = process.cwd()): boolean {
  try {
    const testFile = path.join(testPath, '.write-test-' + Date.now());
    fs.writeFileSync(testFile, 'test', 'utf-8');
    fs.unlinkSync(testFile);
    return true;
  } catch (error) {
    console.warn('[FILESYSTEM] Filesystem is read-only:', testPath);
    return false;
  }
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
      error.helpMessage = `The file ${path.basename(filePath)} does not exist. Please ensure it is present in your deployment.`;
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
      fsError.helpMessage = 'The file contains invalid JSON syntax. Please check for missing commas, quotes, or brackets.';
      console.error('[FILESYSTEM] ❌ JSON parsing error:', fsError.message);
      throw fsError;
    }
    
    if (error instanceof Error && 'code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'EACCES') {
        const fsError: FilesystemError = new Error(`Permission denied reading file: ${filePath}`);
        fsError.code = 'EACCES';
        fsError.helpMessage = 'The application does not have permission to read this file.';
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
 */
export function writeJSONFile<T>(filePath: string, data: T): void {
  console.log('[FILESYSTEM] Writing file:', filePath);
  
  try {
    const dir = path.dirname(filePath);
    
    // Check if directory is writable first
    if (!isFilesystemWritable(dir)) {
      const error: FilesystemError = new Error('Filesystem is read-only');
      error.code = 'EROFS';
      error.isReadOnly = true;
      error.helpMessage = 
        'The filesystem is read-only (common in serverless environments like Vercel). ' +
        'To persist data in production, you need to use a database or external storage service. ' +
        'Local development works fine, but production deployments require persistent storage.';
      console.error('[FILESYSTEM] ❌ Read-only filesystem error');
      throw error;
    }
    
    // Write the file
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log('[FILESYSTEM] ✓ File written successfully, size:', jsonContent.length, 'bytes');
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error instanceof Error && 'isReadOnly' in error) {
      throw error;
    }
    
    // Handle other Node.js filesystem errors
    if (error instanceof Error && 'code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      
      if (nodeError.code === 'EACCES') {
        const fsError: FilesystemError = new Error(`Permission denied writing to file: ${filePath}`);
        fsError.code = 'EACCES';
        fsError.helpMessage = 'The application does not have permission to write to this file or directory.';
        console.error('[FILESYSTEM] ❌ Permission error:', fsError.message);
        throw fsError;
      }
      
      if (nodeError.code === 'EROFS') {
        const fsError: FilesystemError = new Error('Filesystem is read-only');
        fsError.code = 'EROFS';
        fsError.isReadOnly = true;
        fsError.helpMessage = 
          'The filesystem is read-only (common in serverless environments). ' +
          'You need to use a database or external storage for production deployments.';
        console.error('[FILESYSTEM] ❌ Read-only filesystem error');
        throw fsError;
      }
      
      if (nodeError.code === 'ENOENT') {
        const fsError: FilesystemError = new Error(`Directory not found: ${path.dirname(filePath)}`);
        fsError.code = 'ENOENT';
        fsError.helpMessage = 'The parent directory does not exist. Please ensure the directory structure is correct.';
        console.error('[FILESYSTEM] ❌ Directory not found:', fsError.message);
        throw fsError;
      }
    }
    
    console.error('[FILESYSTEM] ❌ Error writing file:', error);
    throw error;
  }
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
