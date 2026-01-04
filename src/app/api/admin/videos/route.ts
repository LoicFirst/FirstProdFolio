import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import videosData from '@/data/videos.json';
import fs from 'fs';
import path from 'path';

const VIDEOS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'videos.json');

// Helper to read videos from JSON file
function readVideos() {
  const content = fs.readFileSync(VIDEOS_FILE_PATH, 'utf-8');
  return JSON.parse(content);
}

// Helper to write videos to JSON file
function writeVideos(data: typeof videosData) {
  fs.writeFileSync(VIDEOS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all videos
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/videos');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const data = readVideos();
    console.log(`[API] ✓ Retrieved ${data.videos.length} videos`);
    return NextResponse.json({ videos: data.videos });
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

    const data = readVideos();
    const body = await request.json();

    console.log('[API] Creating video with title:', body.title);

    // Generate a unique ID
    const count = data.videos.length;
    const id = `video-${String(count + 1).padStart(3, '0')}-${Date.now()}`;

    const newVideo = {
      ...body,
      id,
    };

    data.videos.push(newVideo);
    writeVideos(data);

    console.log('[API] ✓ Video created successfully:', newVideo.id);
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

    const data = readVideos();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Video ID is missing in update request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Updating video:', id);

    const index = data.videos.findIndex((v: any) => v.id === id);
    if (index === -1) {
      console.error('[API] Video not found:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    data.videos[index] = { ...data.videos[index], ...updateData, id };
    writeVideos(data);

    console.log('[API] ✓ Video updated successfully:', id);
    return NextResponse.json({ video: data.videos[index] });
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

    const data = readVideos();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Video ID is missing in delete request');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting video:', id);

    const initialLength = data.videos.length;
    data.videos = data.videos.filter((v: any) => v.id !== id);

    if (data.videos.length === initialLength) {
      console.error('[API] Video not found for deletion:', id);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    writeVideos(data);

    console.log('[API] ✓ Video deleted successfully:', id);
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/videos');
  }
}
