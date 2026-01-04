import { NextResponse } from 'next/server';
// Import fallback data
import aboutData from '@/data/about.json';

export async function GET() {
  try {
    // Return static JSON data
    return NextResponse.json(aboutData);
  } catch (error) {
    console.error('Error fetching about:', error);
    // Return static data as fallback
    return NextResponse.json(aboutData);
  }
}
