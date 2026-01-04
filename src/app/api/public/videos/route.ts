import { NextResponse } from 'next/server';
import { getVideosCollection } from '@/lib/storage/mongodb';

/**
 * GET - Get all videos for public display
 * This route reads from MongoDB to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/videos');
  
  try {
    const collection = await getVideosCollection();
    const videos = await collection.find({}).toArray();
    
    // Remove MongoDB _id field from results
    const cleanVideos = videos.map(({ _id, ...video }) => video);
    
    console.log('[API] ✓ Retrieved', cleanVideos.length, 'videos from MongoDB');
    
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
    console.error('[API] Error reading videos from MongoDB:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch videos', videos: [] },
      { status: 500 }
    );
  }
}
