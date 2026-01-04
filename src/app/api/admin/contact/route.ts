import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { readJSONFile, writeJSONFile } from '@/lib/filesystem';
import path from 'path';

const CONTACT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'contact.json');

interface ContactData {
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
  };
  social?: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  availability?: {
    status: string;
    message: string;
  };
}

// Helper to read contact from JSON file
function readContact(): ContactData {
  return readJSONFile<ContactData>(CONTACT_FILE_PATH);
}

// Helper to write contact to JSON file
function writeContact(data: ContactData): void {
  writeJSONFile(CONTACT_FILE_PATH, data);
}

// GET contact data
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/contact');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const contact = readContact();
    console.log('[API] ✓ Retrieved contact data');
    return NextResponse.json({ contact });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/contact');
  }
}

// POST create or update contact data
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/contact');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    console.log('[API] Updating contact data');

    writeContact(body);

    console.log('[API] ✓ Contact data updated successfully');
    return NextResponse.json({ contact: body }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/contact');
  }
}

// PUT update contact data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
