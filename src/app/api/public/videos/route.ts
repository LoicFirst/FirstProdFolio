import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Video from '@/models/Video';

// Import fallback data
import videosData from '@/data/videos.json';

export async function GET() {
  try {
    // Try to connect to database
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const videos = await Video.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
        
        if (videos && videos.length > 0) {
          return NextResponse.json({ videos });
        }
      } catch {
        console.log('Database not available, using static data');
      }
    }

    // Fallback to static JSON data
    return NextResponse.json({ videos: videosData.videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return static data as ultimate fallback
    return NextResponse.json({ videos: videosData.videos });
  }
}
