import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Video from '@/models/Video';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';

// GET all videos
export async function GET() {
  logApiRequest('GET', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const videos = await Video.find().sort({ order: 1, createdAt: -1 });

    console.log(`[API] ✓ Retrieved ${videos.length} videos`);
    return NextResponse.json({ videos });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/videos');
  }
}

// POST create a new video
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const body = await request.json();

    console.log('[API] Creating video with title:', body.title);

    // Generate a unique ID
    const count = await Video.countDocuments();
    const id = `video-${String(count + 1).padStart(3, '0')}-${Date.now()}`;

    const video = await Video.create({
      ...body,
      id,
    });

    console.log('[API] ✓ Video created successfully:', video.id);
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/videos');
  }
}

// PUT update a video
export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Video ID is missing in update request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Updating video:', id);

    const video = await Video.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!video) {
      console.error('[API] Video not found:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log('[API] ✓ Video updated successfully:', id);
    return NextResponse.json({ video });
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/videos');
  }
}

// DELETE a video
export async function DELETE(request: NextRequest) {
  logApiRequest('DELETE', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Video ID is missing in delete request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting video:', id);

    const video = await Video.findOneAndDelete({ id });

    if (!video) {
      console.error('[API] Video not found for deletion:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log('[API] ✓ Video deleted successfully:', id);
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/videos');
  }
}
