import { NextResponse } from 'next/server';
import { getContactCollection } from '@/lib/storage/database';
import { ContactDocument } from '@/lib/storage/types';

/**
 * GET - Get contact data for public display
 * This route reads from database to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/contact');
  
  try {
    const collection = getContactCollection();
    const contactDoc = await collection.findOne({ docId: 'contact-data' });
    
    // Remove database internal fields
    let data = {};
    if (contactDoc) {
      const { _id, docId, ...contact }: Partial<ContactDocument> = contactDoc;
      data = contact;
    }
    
    console.log('[API] ✓ Retrieved contact data from database');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API] Error reading contact data from database:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch contact data' },
      { status: 500 }
    );
  }
}
