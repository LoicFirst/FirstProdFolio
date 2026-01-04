import { NextResponse } from 'next/server';
// Import fallback data
import photosData from '@/data/photos.json';

export async function GET() {
  try {
    // Return static JSON data
    return NextResponse.json({ photos: photosData.photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    // Return static data as fallback
    return NextResponse.json({ photos: photosData.photos });
  }
}
