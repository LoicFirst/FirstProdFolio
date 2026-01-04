import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getAboutCollection } from '@/lib/storage/database';
import { AboutDocument } from '@/lib/storage/types';

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

// Document ID for the single about document in MongoDB
const ABOUT_DOC_ID = 'about-data';

// GET about data
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/about');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const collection = getAboutCollection();
    const aboutDoc = await collection.findOne({ docId: ABOUT_DOC_ID });
    
    // Return the data without the MongoDB _id and docId fields
    if (aboutDoc) {
      const { _id, docId, ...about }: Partial<AboutDocument> = aboutDoc;
      console.log('[API] ✓ Retrieved about data from MongoDB');
      return NextResponse.json({ about });
    }
    
    console.log('[API] ✓ No about data found in MongoDB');
    return NextResponse.json({ about: {} });
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
    console.log('[API] Updating about data in database');

    const collection = getAboutCollection();
    await collection.updateOne(
      { docId: ABOUT_DOC_ID },
      { $set: { ...body, docId: ABOUT_DOC_ID } },
      { upsert: true }
    );

    console.log('[API] ✓ About data updated successfully in database');
    return NextResponse.json({ about: body }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/about');
  }
}

// PUT update about data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
