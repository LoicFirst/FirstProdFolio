import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/upload');
  
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'portfolio';

    if (!file) {
      console.error('[API] No file provided in upload request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[API] Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    console.log('[API] Uploading to Cloudinary folder:', folder);
    const result = await uploadImage(base64, folder);

    console.log('[API] ✓ File uploaded successfully:', result.public_id);
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/upload');
  }
}
