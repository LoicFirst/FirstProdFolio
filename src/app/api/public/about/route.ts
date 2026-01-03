import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import About from '@/models/About';

// Import fallback data
import aboutData from '@/data/about.json';

export async function GET() {
  try {
    // Try to connect to database
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const about = await About.findOne();
        
        if (about) {
          return NextResponse.json(about);
        }
      } catch {
        console.log('Database not available, using static data');
      }
    }

    // Fallback to static JSON data
    return NextResponse.json(aboutData);
  } catch (error) {
    console.error('Error fetching about:', error);
    // Return static data as ultimate fallback
    return NextResponse.json(aboutData);
  }
}
