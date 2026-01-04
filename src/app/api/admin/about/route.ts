import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import aboutData from '@/data/about.json';
import fs from 'fs';
import path from 'path';

const ABOUT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'about.json');

// Helper to read about from JSON file
function readAbout() {
  const content = fs.readFileSync(ABOUT_FILE_PATH, 'utf-8');
  return JSON.parse(content);
}

// Helper to write about to JSON file
function writeAbout(data: typeof aboutData) {
  fs.writeFileSync(ABOUT_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET about data
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/about');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const about = readAbout();
    console.log('[API] ✓ Retrieved about data');
    return NextResponse.json({ about });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/about');
  }
}

// POST create or update about data
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/about');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    console.log('[API] Updating about data');

    writeAbout(body);

    console.log('[API] ✓ About data updated successfully');
    return NextResponse.json({ about: body }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/about');
  }
}

// PUT update about data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
