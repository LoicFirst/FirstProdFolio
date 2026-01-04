import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Photo from '@/models/Photo';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';

// GET all photos
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const photos = await Photo.find().sort({ order: 1, createdAt: -1 });

    console.log(`[API] ✓ Retrieved ${photos.length} photos`);
    return NextResponse.json({ photos });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/photos');
  }
}

// POST create a new photo
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const body = await request.json();

    console.log('[API] Creating photo with title:', body.title);

    // Generate a unique ID
    const count = await Photo.countDocuments();
    const id = `photo-${String(count + 1).padStart(3, '0')}-${Date.now()}`;

    const photo = await Photo.create({
      ...body,
      id,
    });

    console.log('[API] ✓ Photo created successfully:', photo.id);
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/photos');
  }
}

// PUT update a photo
export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Photo ID is missing in update request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Updating photo:', id);

    const photo = await Photo.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!photo) {
      console.error('[API] Photo not found:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    console.log('[API] ✓ Photo updated successfully:', id);
    return NextResponse.json({ photo });
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/photos');
  }
}

// DELETE a photo
export async function DELETE(request: NextRequest) {
  logApiRequest('DELETE', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Photo ID is missing in delete request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting photo:', id);

    const photo = await Photo.findOneAndDelete({ id });

    if (!photo) {
      console.error('[API] Photo not found for deletion:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    console.log('[API] ✓ Photo deleted successfully:', id);
    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/photos');
  }
}
