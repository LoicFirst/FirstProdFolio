import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User, Video, Photo, About, Contact } from '@/models';

// Import static data
import videosData from '@/data/videos.json';
import photosData from '@/data/photos.json';
import aboutData from '@/data/about.json';
import contactData from '@/data/contact.json';

export async function POST(request: NextRequest) {
  try {
    // Check for seed secret in request
    const body = await request.json();
    const seedSecret = process.env.NEXTAUTH_SECRET;

    if (body.secret !== seedSecret) {
      return NextResponse.json({ error: 'Invalid seed secret' }, { status: 401 });
    }

    await dbConnect();

    // Check if admin user already exists
    const existingUser = await User.findOne({ role: 'admin' });
    
    if (!existingUser) {
      // Create admin user
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@loicmazagran.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Loic Mazagran',
        role: 'admin',
      });
      console.log('Admin user created');
    }

    // Seed videos if collection is empty
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      await Video.insertMany(
        videosData.videos.map((video, index) => ({
          ...video,
          isPublished: true,
          order: index,
        }))
      );
      console.log('Videos seeded');
    }

    // Seed photos if collection is empty
    const photoCount = await Photo.countDocuments();
    if (photoCount === 0) {
      await Photo.insertMany(
        photosData.photos.map((photo, index) => ({
          ...photo,
          isPublished: true,
          order: index,
        }))
      );
      console.log('Photos seeded');
    }

    // Seed about if collection is empty
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      await About.create(aboutData);
      console.log('About seeded');
    }

    // Seed contact if collection is empty
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      await Contact.create(contactData);
      console.log('Contact seeded');
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      seeded: {
        videos: videoCount === 0,
        photos: photoCount === 0,
        about: aboutCount === 0,
        contact: contactCount === 0,
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
