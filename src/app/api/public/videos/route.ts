import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIDEOS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'videos.json');

/**
 * GET - Get all videos for public display
 * This route reads from the filesystem to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/videos');
  
  try {
    // Read from filesystem to get latest data
    const fileContent = fs.readFileSync(VIDEOS_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log('[API] ✓ Retrieved', data.videos?.length || 0, 'videos from filesystem');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(
      { videos: data.videos || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading videos from filesystem:', error);
    
    // Provide specific error details
    let errorMessage = 'Failed to fetch videos';
    if (error instanceof Error && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        errorMessage = 'Videos data file not found';
      } else if (fsError.code === 'EACCES') {
        errorMessage = 'Permission denied accessing videos data';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Videos data file contains invalid JSON';
    }
    
    return NextResponse.json(
      { error: errorMessage, videos: [] },
      { status: 500 }
    );
  }
}
