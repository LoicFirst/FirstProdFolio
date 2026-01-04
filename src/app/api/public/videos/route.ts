import { NextResponse } from 'next/server';
// Import fallback data
import videosData from '@/data/videos.json';

export async function GET() {
  try {
    // Return static JSON data
    return NextResponse.json({ videos: videosData.videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return static data as fallback
    return NextResponse.json({ videos: videosData.videos });
  }
}
