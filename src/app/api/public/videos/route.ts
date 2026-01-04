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
    return NextResponse.json({ videos: data.videos || [] });
  } catch (error) {
    console.error('[API] Error reading videos from filesystem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', videos: [] },
      { status: 500 }
    );
  }
}
