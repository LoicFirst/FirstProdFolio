import { NextResponse } from 'next/server';
// Import fallback data
import contactData from '@/data/contact.json';

export async function GET() {
  try {
    // Return static JSON data
    return NextResponse.json(contactData);
  } catch (error) {
    console.error('Error fetching contact:', error);
    // Return static data as fallback
    return NextResponse.json(contactData);
  }
}
