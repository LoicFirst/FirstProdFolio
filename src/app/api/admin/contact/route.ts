import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Contact from '@/models/Contact';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';

// GET contact data
export async function GET() {
  logApiRequest('GET', '/api/admin/contact');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const contact = await Contact.findOne();

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
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const body = await request.json();

    console.log('[API] Upserting contact data');

    // Upsert - create if doesn't exist, update if exists
    const contact = await Contact.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true, runValidators: true }
    );

    console.log('[API] ✓ Contact data updated successfully');
    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/contact');
  }
}

// PUT update contact data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
