import { NextResponse } from 'next/server';
import { getVideosCollection } from '@/lib/storage/database';
import { cache, CACHE_TTL } from '@/lib/cache';

const CACHE_KEY = 'public:videos';

/**
 * GET - Get all videos for public display
 * This route reads from database with caching to ensure good performance
 * while still allowing real-time synchronization with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/videos');
  
  try {
    // Try to get from cache first
    const cached = cache.get<any>(CACHE_KEY);
    if (cached) {
      console.log('[API] ✓ Returning cached videos');
      return NextResponse.json(
        { videos: cached },
        {
          headers: {
            'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
            'X-Cache': 'HIT',
          },
        }
      );
    }

    // Fetch from database with timeout
    const collection = getVideosCollection();
    const cursor = await collection.find({});
    const videos = await cursor.toArray();
    
    // Remove database _id field from results
    const cleanVideos = videos.map(({ _id, ...video }) => video);
    
    // Cache the results
    cache.set(CACHE_KEY, cleanVideos, CACHE_TTL.SHORT);
    
    console.log('[API] ✓ Retrieved', cleanVideos.length, 'videos from database');
    
    // Return with cache control headers
    return NextResponse.json(
      { videos: cleanVideos },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
          'X-Cache': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading videos from database:', error);
    
    // Try to return stale cache on error
    const staleCache = cache.get<any>(CACHE_KEY);
    if (staleCache) {
      console.log('[API] ⚠️ Returning stale cache due to error');
      return NextResponse.json(
        { videos: staleCache },
        {
          headers: {
            'Cache-Control': 'public, max-age=10',
            'X-Cache': 'STALE',
          },
        }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch videos', videos: [] },
      { status: 500 }
    );
  }
}
