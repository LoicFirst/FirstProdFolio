import { NextResponse } from 'next/server';
import { getContactCollection } from '@/lib/storage/database';
import { ContactDocument } from '@/lib/storage/types';
import { cache, CACHE_TTL } from '@/lib/cache';

const CACHE_KEY = 'public:contact';

type ContactData = Partial<Omit<ContactDocument, '_id' | 'docId'>>;

/**
 * GET - Get contact data for public display
 * This route reads from database with caching to ensure good performance
 * while still allowing real-time synchronization with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/contact');
  
  try {
    // Try to get from cache first
    const cached = cache.get<ContactData>(CACHE_KEY);
    if (cached) {
      console.log('[API] ✓ Returning cached contact data');
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from database with timeout
    const collection = getContactCollection();
    const contactDoc = await collection.findOne({ docId: 'contact-data' });
    
    // Remove database internal fields
    let data: ContactData = {};
    if (contactDoc) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, docId, ...contact }: Partial<ContactDocument> = contactDoc;
      data = contact;
    }
    
    // Cache the results
    cache.set(CACHE_KEY, data, CACHE_TTL.MEDIUM);
    
    console.log('[API] ✓ Retrieved contact data from database');
    
    // Return with cache control headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[API] Error reading contact data from database:', error);
    
    // Try to return stale cache on error
    const staleCache = cache.get<ContactData>(CACHE_KEY);
    if (staleCache) {
      console.log('[API] ⚠️ Returning stale cache due to error');
      return NextResponse.json(staleCache, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'STALE',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch contact data' },
      { status: 500 }
    );
  }
}
