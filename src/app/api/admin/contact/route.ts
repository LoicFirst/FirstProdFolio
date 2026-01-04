import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getContactCollection } from '@/lib/storage/database';
import { ContactDocument } from '@/lib/storage/types';

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

// Document ID for the single contact document in the database
const CONTACT_DOC_ID = 'contact-data';

// GET contact data
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/contact');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const collection = getContactCollection();
    const contactDoc = await collection.findOne({ docId: CONTACT_DOC_ID });
    
    // Return the data without the _id and docId fields
    if (contactDoc) {
      const { _id, docId, ...contact }: Partial<ContactDocument> = contactDoc;
      console.log('[API] ✓ Retrieved contact data from database');
      return NextResponse.json({ contact });
    }
    
    console.log('[API] ✓ No contact data found in database');
    return NextResponse.json({ contact: {} });
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
    console.log('[API] Updating contact data in database');

    const collection = getContactCollection();
    await collection.updateOne(
      { docId: CONTACT_DOC_ID },
      { $set: { ...body, docId: CONTACT_DOC_ID } },
      { upsert: true }
    );

    console.log('[API] ✓ Contact data updated successfully in database');
    return NextResponse.json({ contact: body }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/contact');
  }
}

// PUT update contact data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
