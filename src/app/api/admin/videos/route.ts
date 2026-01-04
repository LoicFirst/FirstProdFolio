import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getVideosCollection } from '@/lib/storage/database';
import { VideoDocument } from '@/lib/storage/types';

// GET all videos
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const collection = getVideosCollection();
    const videos = await collection.find({}).toArray();
    
    // Remove database _id field from results
    const cleanVideos = videos.map(({ _id, ...video }) => video);
    
    console.log(`[API] ✓ Retrieved ${cleanVideos.length} videos from database`);
    return NextResponse.json({ videos: cleanVideos });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/videos');
  }
}

// POST create a new video
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    console.log('[API] Creating video with title:', body.title);

    const collection = getVideosCollection();
    
    // Generate a unique ID using timestamp and random string for better uniqueness
    // The timestamp ensures chronological ordering, and random suffix prevents collisions
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const id = `video-${Date.now()}-${randomSuffix}`;

    const newVideo: VideoDocument = {
      id,
      title: body.title,
      description: body.description,
      video_url: body.video_url,
      ...(body.year && { year: body.year }),
      ...(body.thumbnail_url && { thumbnail_url: body.thumbnail_url }),
      ...(body.duration && { duration: body.duration }),
      ...(body.category && { category: body.category }),
    };

    await collection.insertOne(newVideo);

    console.log('[API] ✓ Video created successfully in database:', newVideo.id);
    return NextResponse.json({ video: newVideo }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/videos');
  }
}

// PUT update a video
export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Video ID is missing in update request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Updating video:', id);

    const collection = getVideosCollection();
    const result = await collection.updateOne(
      { id },
      { $set: { ...updateData, id } }
    );

    if (result.matchedCount === 0) {
      console.error('[API] Video not found:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const updatedVideo = { ...updateData, id };
    console.log('[API] ✓ Video updated successfully in database:', id);
    return NextResponse.json({ video: updatedVideo });
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/videos');
  }
}

// DELETE a video
export async function DELETE(request: NextRequest) {
  logApiRequest('DELETE', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Video ID is missing in delete request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting video:', id);

    const collection = getVideosCollection();
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      console.error('[API] Video not found for deletion:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log('[API] ✓ Video deleted successfully from database:', id);
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/videos');
  }
}
