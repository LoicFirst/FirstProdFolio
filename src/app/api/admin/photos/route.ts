import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getPhotosCollection } from '@/lib/storage/database';
import { PhotoDocument } from '@/lib/storage/types';

// GET all photos
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const collection = getPhotosCollection();
    const photos = await collection.find({}).toArray();
    
    // Remove internal _id field from results
    const cleanPhotos = photos.map(({ _id, ...photo }) => photo);
    
    console.log(`[API] ✓ Retrieved ${cleanPhotos.length} photos from database`);
    return NextResponse.json({ photos: cleanPhotos });
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

    const body = await request.json();
    console.log('[API] Creating photo with title:', body.title);

    const collection = getPhotosCollection();
    
    // Generate a unique ID using timestamp and random string for better uniqueness
    // The timestamp ensures chronological ordering, and random suffix prevents collisions
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const id = `photo-${Date.now()}-${randomSuffix}`;

    const newPhoto: PhotoDocument = {
      id,
      title: body.title,
      description: body.description,
      image_url: body.image_url,
      ...(body.year && { year: body.year }),
      ...(body.thumbnail_url && { thumbnail_url: body.thumbnail_url }),
      ...(body.category && { category: body.category }),
      ...(body.location && { location: body.location }),
    };

    await collection.insertOne(newPhoto);

    console.log('[API] ✓ Photo created successfully in database:', newPhoto.id);
    return NextResponse.json({ photo: newPhoto }, { status: 201 });
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Photo ID is missing in update request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Updating photo:', id);

    const collection = getPhotosCollection();
    const result = await collection.updateOne(
      { id },
      { $set: { ...updateData, id } }
    );

    if (result && (result as any).matchedCount === 0) {
      console.error('[API] Photo not found:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const updatedPhoto = { ...updateData, id };
    console.log('[API] ✓ Photo updated successfully in database:', id);
    return NextResponse.json({ photo: updatedPhoto });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Photo ID is missing in delete request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting photo:', id);

    const collection = getPhotosCollection();
    const result = await collection.deleteOne({ id });

    if (result && (result as any).deletedCount === 0) {
      console.error('[API] Photo not found for deletion:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    console.log('[API] ✓ Photo deleted successfully from database:', id);
    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/photos');
  }
}
