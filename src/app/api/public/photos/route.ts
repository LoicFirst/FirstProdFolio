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
    return NextResponse.json({ photos: data.photos || [] });
  } catch (error) {
    console.error('[API] Error reading photos from filesystem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [] },
      { status: 500 }
    );
  }
}
