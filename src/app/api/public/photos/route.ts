import { NextResponse } from 'next/server';
import { getPhotosCollection } from '@/lib/storage/database';
import { cache, CACHE_TTL } from '@/lib/cache';
import { PhotoDocument } from '@/lib/storage/types';

const CACHE_KEY = 'public:photos';

type CleanPhoto = Omit<PhotoDocument, '_id'>;

/**
 * GET - Get all photos for public display
 * This route reads from database with caching to ensure good performance
 * while still allowing real-time synchronization with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/photos');
  
  try {
    // Try to get from cache first
    const cached = cache.get<CleanPhoto[]>(CACHE_KEY);
    if (cached) {
      console.log('[API] ✓ Returning cached photos');
      return NextResponse.json(
        { photos: cached },
        {
          headers: {
            'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
            'X-Cache': 'HIT',
          },
        }
      );
    }

    // Fetch from database with timeout
    const collection = getPhotosCollection();
    const cursor = await collection.find({});
    const photos = await cursor.toArray();
    
    // Remove database _id field from results
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleanPhotos: CleanPhoto[] = photos.map(({ _id, ...photo }) => photo);
    
    // Cache the results
    cache.set(CACHE_KEY, cleanPhotos, CACHE_TTL.SHORT);
    
    console.log('[API] ✓ Retrieved', cleanPhotos.length, 'photos from database');
    
    // Return with cache control headers
    return NextResponse.json(
      { photos: cleanPhotos },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
          'X-Cache': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading photos from database:', error);
    
    // Try to return stale cache on error
    const staleCache = cache.get<CleanPhoto[]>(CACHE_KEY);
    if (staleCache) {
      console.log('[API] ⚠️ Returning stale cache due to error');
      return NextResponse.json(
        { photos: staleCache },
        {
          headers: {
            'Cache-Control': 'public, max-age=10',
            'X-Cache': 'STALE',
          },
        }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [] },
      { status: 500 }
    );
  }
}
