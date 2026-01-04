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
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error reading about data from filesystem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}
