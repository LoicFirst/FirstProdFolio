import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Photo from '@/models/Photo';

// Import fallback data
import photosData from '@/data/photos.json';

export async function GET() {
  try {
    // Try to connect to database
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const photos = await Photo.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
        
        if (photos && photos.length > 0) {
          return NextResponse.json({ photos });
        }
      } catch {
        console.log('Database not available, using static data');
      }
    }

    // Fallback to static JSON data
    return NextResponse.json({ photos: photosData.photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    // Return static data as ultimate fallback
    return NextResponse.json({ photos: photosData.photos });
  }
}
