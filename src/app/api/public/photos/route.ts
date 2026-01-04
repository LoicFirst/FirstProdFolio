import { NextResponse } from 'next/server';
import { getPhotosCollection } from '@/lib/storage/mongodb';

/**
 * GET - Get all photos for public display
 * This route reads from MongoDB to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/photos');
  
  try {
    const collection = await getPhotosCollection();
    const photos = await collection.find({}).toArray();
    
    // Remove MongoDB _id field from results
    const cleanPhotos = photos.map(({ _id, ...photo }) => photo);
    
    console.log('[API] ✓ Retrieved', cleanPhotos.length, 'photos from MongoDB');
    
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
    console.error('[API] Error reading photos from MongoDB:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [] },
      { status: 500 }
    );
  }
}
