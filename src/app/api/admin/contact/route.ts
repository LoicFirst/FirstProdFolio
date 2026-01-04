import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import contactData from '@/data/contact.json';
import fs from 'fs';
import path from 'path';

const CONTACT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'contact.json');

// Helper to read contact from JSON file
function readContact() {
  const content = fs.readFileSync(CONTACT_FILE_PATH, 'utf-8');
  return JSON.parse(content);
}

// Helper to write contact to JSON file
function writeContact(data: typeof contactData) {
  fs.writeFileSync(CONTACT_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
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
