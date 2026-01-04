import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getSettingsCollection } from '@/lib/storage/database';

// Default settings
const DEFAULT_SETTINGS = {
  docId: 'main',
  lightWaveEffect: true,
  reviewsEnabled: true,
};

// GET site settings
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/settings');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const collection = getSettingsCollection();
    const settings = await collection.findOne({ docId: 'main' });
    
    if (!settings) {
      // Return default settings if none exist
      console.log('[API] No settings found, returning defaults');
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
    
    // Remove database _id field
    const { _id, ...cleanSettings } = settings;
    
    console.log('[API] ✓ Retrieved settings from database');
    return NextResponse.json({ settings: cleanSettings });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/settings');
  }
}

// PUT update site settings
export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/admin/settings');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    
    // Validate settings
    const updateData: { lightWaveEffect?: boolean; reviewsEnabled?: boolean } = {};
    
    if (typeof body.lightWaveEffect === 'boolean') {
      updateData.lightWaveEffect = body.lightWaveEffect;
    }
    
    if (typeof body.reviewsEnabled === 'boolean') {
      updateData.reviewsEnabled = body.reviewsEnabled;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 });
    }

    console.log('[API] Updating settings:', updateData);

    const collection = getSettingsCollection();
    
    // Upsert the settings document
    const result = await collection.updateOne(
      { docId: 'main' },
      { 
        $set: { ...updateData, docId: 'main' }
      },
      { upsert: true }
    );

    console.log('[API] ✓ Settings updated successfully');
    
    // Fetch updated settings
    const updatedSettings = await collection.findOne({ docId: 'main' });
    
    if (updatedSettings) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...cleanSettings } = updatedSettings;
      return NextResponse.json({ settings: cleanSettings });
    }
    
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/settings');
  }
}
