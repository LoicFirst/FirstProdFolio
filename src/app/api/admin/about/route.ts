import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import About from '@/models/About';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';

// GET about data
export async function GET() {
  logApiRequest('GET', '/api/admin/about');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const about = await About.findOne();

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
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const body = await request.json();

    console.log('[API] Upserting about data');

    // Upsert - create if doesn't exist, update if exists
    const about = await About.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true, runValidators: true }
    );

    console.log('[API] ✓ About data updated successfully');
    return NextResponse.json({ about }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/about');
  }
}

// PUT update about data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
