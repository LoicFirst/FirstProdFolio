import { NextResponse } from 'next/server';
import { getPhotosCollection } from '@/lib/storage/database';

/**
 * GET - Get all photos for public display
 * This route reads from database to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/photos');
  
  try {
    const collection = getPhotosCollection();
    const cursor = await collection.find({});
    const photos = await cursor.toArray();
    
    // Remove database _id field from results
    const cleanPhotos = photos.map(({ _id, ...photo }) => photo);
    
    console.log('[API] ✓ Retrieved', cleanPhotos.length, 'photos from database');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(
      { photos: cleanPhotos },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading photos from database:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [] },
      { status: 500 }
    );
  }
}
