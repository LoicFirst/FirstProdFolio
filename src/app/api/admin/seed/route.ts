import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User, Video, Photo, About, Contact } from '@/models';
import { logApiRequest } from '@/lib/api-helpers';

// Import static data
import videosData from '@/data/videos.json';
import photosData from '@/data/photos.json';
import aboutData from '@/data/about.json';
import contactData from '@/data/contact.json';

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/seed');
  
  try {
    // Check for seed secret in request
    const body = await request.json();
    const seedSecret = process.env.NEXTAUTH_SECRET;

    if (body.secret !== seedSecret) {
      console.error('[SEED] Invalid seed secret provided');
      return NextResponse.json({ error: 'Invalid seed secret' }, { status: 401 });
    }

    console.log('[SEED] Starting database seed process...');
    await dbConnect();

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@loicmazagran.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    const adminName = process.env.ADMIN_NAME || 'Admin';

    console.log('[SEED] Admin credentials:', { email: adminEmail, name: adminName });

    // Validate password meets minimum requirements (8 characters as per User model)
    if (adminPassword.length < 8) {
      console.error('[SEED] Admin password too short:', adminPassword.length, 'characters');
      return NextResponse.json({ 
        error: 'ADMIN_PASSWORD must be at least 8 characters' 
      }, { status: 400 });
    }

    // Track admin user status
    let adminUserStatus: 'created' | 'updated' | 'unchanged' = 'unchanged';

    // Check if admin user already exists
    console.log('[SEED] Checking for existing admin user...');
    const existingUser = await User.findOne({ role: 'admin' }).select('+password');
    
    if (!existingUser) {
      // Create admin user
      console.log('[SEED] Creating new admin user...');
      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
      });
      adminUserStatus = 'created';
      console.log('[SEED] ✓ Admin user created');
    } else {
      // Check if email, name, or password needs to be updated
      const forceUpdate = body.forceUpdate === true;
      const emailNeedsUpdate = existingUser.email !== adminEmail;
      const nameNeedsUpdate = existingUser.name !== adminName;
      
      // Check if password is different by verifying against the env password
      const passwordMatches = await existingUser.comparePassword(adminPassword);
      const passwordNeedsUpdate = !passwordMatches;
      
      console.log('[SEED] Admin user update check:', { 
        emailNeedsUpdate, 
        nameNeedsUpdate, 
        passwordNeedsUpdate, 
        forceUpdate 
      });
      
      if (emailNeedsUpdate || nameNeedsUpdate || passwordNeedsUpdate || forceUpdate) {
        console.log('[SEED] Updating admin user...');
        existingUser.email = adminEmail;
        existingUser.name = adminName;
        existingUser.password = adminPassword;
        await existingUser.save();
        adminUserStatus = 'updated';
        console.log('[SEED] ✓ Admin user updated');
      } else {
        console.log('[SEED] Admin user is up to date');
      }
    }

    // Seed videos if collection is empty
    const videoCount = await Video.countDocuments();
    console.log('[SEED] Video count:', videoCount);
    if (videoCount === 0) {
      console.log('[SEED] Seeding videos...');
      await Video.insertMany(
        videosData.videos.map((video, index) => ({
          ...video,
          isPublished: true,
          order: index,
        }))
      );
      console.log('[SEED] ✓ Videos seeded');
    }

    // Seed photos if collection is empty
    const photoCount = await Photo.countDocuments();
    console.log('[SEED] Photo count:', photoCount);
    if (photoCount === 0) {
      console.log('[SEED] Seeding photos...');
      await Photo.insertMany(
        photosData.photos.map((photo, index) => ({
          ...photo,
          isPublished: true,
          order: index,
        }))
      );
      console.log('[SEED] ✓ Photos seeded');
    }

    // Seed about if collection is empty
    const aboutCount = await About.countDocuments();
    console.log('[SEED] About count:', aboutCount);
    if (aboutCount === 0) {
      console.log('[SEED] Seeding about...');
      await About.create(aboutData);
      console.log('[SEED] ✓ About seeded');
    }

    // Seed contact if collection is empty
    const contactCount = await Contact.countDocuments();
    console.log('[SEED] Contact count:', contactCount);
    if (contactCount === 0) {
      console.log('[SEED] Seeding contact...');
      await Contact.create(contactData);
      console.log('[SEED] ✓ Contact seeded');
    }

    console.log('[SEED] ✓ Database seed completed successfully');

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      seeded: {
        adminUser: adminUserStatus,
        videos: videoCount === 0,
        photos: photoCount === 0,
        about: aboutCount === 0,
        contact: contactCount === 0,
      }
    });
  } catch (error) {
    console.error('[SEED] Error seeding database:', error);
    if (error instanceof Error) {
      console.error('[SEED] Error message:', error.message);
      console.error('[SEED] Error stack:', error.stack);
    }
    return NextResponse.json({ 
      error: 'Seed failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
