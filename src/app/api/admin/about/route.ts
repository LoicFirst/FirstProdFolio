import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { readJSONFile, writeJSONFile } from '@/lib/filesystem';
import path from 'path';

const ABOUT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'about.json');

interface AboutData {
  profile?: {
    name?: string;
    title?: string;
    bio?: string;
    photo_url?: string;
    experience_years?: number;
    location?: string;
  };
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  software?: Array<{
    name: string;
    level: number;
    icon?: string;
  }>;
  achievements?: Array<{
    year: number;
    title: string;
    event: string;
  }>;
}

// Helper to read about from JSON file
function readAbout(): AboutData {
  return readJSONFile<AboutData>(ABOUT_FILE_PATH);
}

// Helper to write about to JSON file
function writeAbout(data: AboutData): void {
  writeJSONFile(ABOUT_FILE_PATH, data);
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
