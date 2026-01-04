import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import photosData from '@/data/photos.json';
import fs from 'fs';
import path from 'path';

const PHOTOS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'photos.json');

// Helper to read photos from JSON file
function readPhotos() {
  const content = fs.readFileSync(PHOTOS_FILE_PATH, 'utf-8');
  return JSON.parse(content);
}

// Helper to write photos to JSON file
function writePhotos(data: typeof photosData) {
  fs.writeFileSync(PHOTOS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all photos
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/photos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const data = readPhotos();
    console.log(`[API] ✓ Retrieved ${data.photos.length} photos`);
    return NextResponse.json({ photos: data.photos });
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

    const data = readPhotos();
    const body = await request.json();

    console.log('[API] Creating photo with title:', body.title);

    // Generate a unique ID
    const count = data.photos.length;
    const id = `photo-${String(count + 1).padStart(3, '0')}-${Date.now()}`;

    const newPhoto = {
      ...body,
      id,
    };

    data.photos.push(newPhoto);
    writePhotos(data);

    console.log('[API] ✓ Photo created successfully:', newPhoto.id);
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

    const data = readPhotos();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Photo ID is missing in update request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Updating photo:', id);

    const index = data.photos.findIndex((p: any) => p.id === id);
    if (index === -1) {
      console.error('[API] Photo not found:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    data.photos[index] = { ...data.photos[index], ...updateData, id };
    writePhotos(data);

    console.log('[API] ✓ Photo updated successfully:', id);
    return NextResponse.json({ photo: data.photos[index] });
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

    const data = readPhotos();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Photo ID is missing in delete request');
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting photo:', id);

    const initialLength = data.photos.length;
    data.photos = data.photos.filter((p: any) => p.id !== id);

    if (data.photos.length === initialLength) {
      console.error('[API] Photo not found for deletion:', id);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    writePhotos(data);

    console.log('[API] ✓ Photo deleted successfully:', id);
    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/photos');
  }
}
