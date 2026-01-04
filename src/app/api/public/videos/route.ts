import { NextResponse } from 'next/server';
import { getVideosCollection } from '@/lib/storage/database';

/**
 * GET - Get all videos for public display
 * This route reads from database to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/videos');
  
  try {
    const collection = getVideosCollection();
    const cursor = await collection.find({});
    const videos = await cursor.toArray();
    
    // Remove database _id field from results
    const cleanVideos = videos.map(({ _id, ...video }) => video);
    
    console.log('[API] ✓ Retrieved', cleanVideos.length, 'videos from database');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(
      { videos: cleanVideos },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading videos from database:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch videos', videos: [] },
      { status: 500 }
    );
  }
}
