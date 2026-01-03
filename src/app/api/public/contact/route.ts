import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Contact from '@/models/Contact';

// Import fallback data
import contactData from '@/data/contact.json';

export async function GET() {
  try {
    // Try to connect to database
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const contact = await Contact.findOne();
        
        if (contact) {
          return NextResponse.json(contact);
        }
      } catch {
        console.log('Database not available, using static data');
      }
    }

    // Fallback to static JSON data
    return NextResponse.json(contactData);
  } catch (error) {
    console.error('Error fetching contact:', error);
    // Return static data as ultimate fallback
    return NextResponse.json(contactData);
  }
}
