import { NextResponse } from 'next/server';
import { getAboutCollection } from '@/lib/storage/mongodb';

/**
 * GET - Get about data for public display
 * This route reads from MongoDB to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/about');
  
  try {
    const collection = await getAboutCollection();
    const aboutDoc = await collection.findOne({ docId: 'about-data' });
    
    // Remove MongoDB internal fields
    let data = {};
    if (aboutDoc) {
      const { _id, docId, ...about } = aboutDoc as any;
      data = about;
    }
    
    console.log('[API] ✓ Retrieved about data from MongoDB');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API] Error reading about data from MongoDB:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}
