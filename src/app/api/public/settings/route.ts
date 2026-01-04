import { NextResponse } from 'next/server';
import { getSettingsCollection } from '@/lib/storage/mongodb';

// Default settings
const DEFAULT_SETTINGS = {
  lightWaveEffect: true,
  reviewsEnabled: true,
};

/**
 * GET - Get public site settings (no auth required)
 * Returns settings that affect the public site display
 */
export async function GET() {
  console.log('[API] GET /api/public/settings');
  
  try {
    const collection = await getSettingsCollection();
    const settings = await collection.findOne({ docId: 'main' });
    
    if (!settings) {
      console.log('[API] No settings found, returning defaults');
      return NextResponse.json(
        { settings: DEFAULT_SETTINGS },
        {
          headers: {
            'Cache-Control': 'public, max-age=60', // Cache for 1 minute
          },
        }
      );
    }
    
    // Only return public-facing settings
    const publicSettings = {
      lightWaveEffect: settings.lightWaveEffect ?? DEFAULT_SETTINGS.lightWaveEffect,
      reviewsEnabled: settings.reviewsEnabled ?? DEFAULT_SETTINGS.reviewsEnabled,
    };
    
    console.log('[API] ✓ Retrieved public settings');
    return NextResponse.json(
      { settings: publicSettings },
      {
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading settings from MongoDB:', error);
    
    // Return defaults on error
    return NextResponse.json(
      { settings: DEFAULT_SETTINGS },
      { status: 200 }
    );
  }
}
