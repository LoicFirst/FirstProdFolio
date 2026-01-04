import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ABOUT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'about.json');

/**
 * GET - Get about data for public display
 * This route reads from the filesystem to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/about');
  
  try {
    // Read from filesystem to get latest data
    const fileContent = fs.readFileSync(ABOUT_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log('[API] ✓ Retrieved about data from filesystem');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API] Error reading about data from filesystem:', error);
    
    // Provide specific error details
    let errorMessage = 'Failed to fetch about data';
    if (error instanceof Error && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        errorMessage = 'About data file not found';
      } else if (fsError.code === 'EACCES') {
        errorMessage = 'Permission denied accessing about data';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'About data file contains invalid JSON';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
