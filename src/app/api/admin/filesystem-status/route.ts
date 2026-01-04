import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getFilesystemInfo } from '@/lib/filesystem';

/**
 * GET /api/admin/filesystem-status
 * Returns information about filesystem writability and environment
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const info = getFilesystemInfo();
    
    console.log('[API] Filesystem status check:');
    console.log('[API]   Environment:', info.environment);
    console.log('[API]   Is Production:', info.isProduction);
    console.log('[API]   CWD Writable:', info.cwdWritable);
    console.log('[API]   /tmp Writable:', info.tmpWritable);
    if (info.warning) {
      console.warn('[API]   Warning:', info.warning);
    }

    return NextResponse.json({
      success: true,
      filesystem: info
    });
  } catch (error) {
    console.error('[API] Error checking filesystem status:', error);
    return NextResponse.json(
      { error: 'Failed to check filesystem status' },
      { status: 500 }
    );
  }
}
