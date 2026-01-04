import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTACT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'contact.json');

/**
 * GET - Get contact data for public display
 * This route reads from the filesystem to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/contact');
  
  try {
    // Read from filesystem to get latest data
    const fileContent = fs.readFileSync(CONTACT_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log('[API] ✓ Retrieved contact data from filesystem');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error reading contact data from filesystem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact data' },
      { status: 500 }
    );
  }
}
