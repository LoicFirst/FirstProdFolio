import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PHOTOS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'photos.json');

/**
 * GET - Get all photos for public display
 * This route reads from the filesystem to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/photos');
  
  try {
    // Read from filesystem to get latest data
    const fileContent = fs.readFileSync(PHOTOS_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log('[API] ✓ Retrieved', data.photos?.length || 0, 'photos from filesystem');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(
      { photos: data.photos || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading photos from filesystem:', error);
    
    // Provide specific error details
    let errorMessage = 'Failed to fetch photos';
    if (error instanceof Error && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        errorMessage = 'Photos data file not found';
      } else if (fsError.code === 'EACCES') {
        errorMessage = 'Permission denied accessing photos data';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Photos data file contains invalid JSON';
    }
    
    return NextResponse.json(
      { error: errorMessage, photos: [] },
      { status: 500 }
    );
  }
}
