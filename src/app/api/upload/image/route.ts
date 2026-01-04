import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { authenticateRequest } from '@/lib/auth/jwt';

/**
 * POST - Upload an image to local storage (protected)
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/upload/image - Upload image');
  
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    console.log('[API] Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save to public/static/images directory
    const uploadsDir = path.join(process.cwd(), 'public', 'static', 'images');
    const filepath = path.join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Return URL path (relative to public directory)
    const url = `/static/images/${filename}`;
    
    console.log('[API] ✓ File uploaded successfully:', url);
    
    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('[API] Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
