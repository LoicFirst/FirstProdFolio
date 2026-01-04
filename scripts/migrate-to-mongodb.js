/**
 * Data Migration Script - JSON to MongoDB
 * 
 * This script helps migrate existing data from JSON files to MongoDB.
 * Run this once after setting up MongoDB to populate the database with your existing data.
 * 
 * Usage:
 *   node scripts/migrate-to-mongodb.js
 * 
 * Prerequisites:
 *   - MONGODB_URI environment variable must be set
 *   - MongoDB driver must be installed (npm install mongodb)
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env files
try {
  require('dotenv').config({ path: '.env.local' });
  if (!process.env.MONGODB_URI) {
    require('dotenv').config(); // Falls back to .env
  }
} catch (error) {
  // dotenv not installed, will use process.env directly
  // This is fine for production environments where env vars are set directly
}

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'portfolio';

// File paths
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ABOUT_FILE = path.join(DATA_DIR, 'about.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contact.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');

// Collection names
const COLLECTIONS = {
  ABOUT: 'about',
  CONTACT: 'contact',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
};

/**
 * Read JSON file safely
 */
function readJSONFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Migrate about data
 */
async function migrateAbout(db) {
  console.log('\n📄 Migrating about data...');
  const data = readJSONFile(ABOUT_FILE);
  
  if (!data) {
    console.log('   ⏭️  Skipping about data migration');
    return;
  }

  const collection = db.collection(COLLECTIONS.ABOUT);
  await collection.updateOne(
    { docId: 'about-data' },
    { $set: { ...data, docId: 'about-data' } },
    { upsert: true }
  );
  
  console.log('   ✅ About data migrated successfully');
}

/**
 * Migrate contact data
 */
async function migrateContact(db) {
  console.log('\n📞 Migrating contact data...');
  const data = readJSONFile(CONTACT_FILE);
  
  if (!data) {
    console.log('   ⏭️  Skipping contact data migration');
    return;
  }

  const collection = db.collection(COLLECTIONS.CONTACT);
  await collection.updateOne(
    { docId: 'contact-data' },
    { $set: { ...data, docId: 'contact-data' } },
    { upsert: true }
  );
  
  console.log('   ✅ Contact data migrated successfully');
}

/**
 * Migrate photos data
 */
async function migratePhotos(db) {
  console.log('\n📸 Migrating photos data...');
  const data = readJSONFile(PHOTOS_FILE);
  
  if (!data || !data.photos) {
    console.log('   ⏭️  Skipping photos data migration');
    return;
  }

  const collection = db.collection(COLLECTIONS.PHOTOS);
  
  // Clear existing photos
  await collection.deleteMany({});
  
  // Insert all photos
  if (data.photos.length > 0) {
    await collection.insertMany(data.photos);
    console.log(`   ✅ Migrated ${data.photos.length} photos successfully`);
  } else {
    console.log('   ℹ️  No photos to migrate');
  }
}

/**
 * Migrate videos data
 */
async function migrateVideos(db) {
  console.log('\n🎬 Migrating videos data...');
  const data = readJSONFile(VIDEOS_FILE);
  
  if (!data || !data.videos) {
    console.log('   ⏭️  Skipping videos data migration');
    return;
  }

  const collection = db.collection(COLLECTIONS.VIDEOS);
  
  // Clear existing videos
  await collection.deleteMany({});
  
  // Insert all videos
  if (data.videos.length > 0) {
    await collection.insertMany(data.videos);
    console.log(`   ✅ Migrated ${data.videos.length} videos successfully`);
  } else {
    console.log('   ℹ️  No videos to migrate');
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting data migration from JSON to MongoDB...');
  console.log('='.repeat(60));

  // Check for MongoDB URI
  if (!MONGODB_URI) {
    console.error('\n❌ Error: MONGODB_URI environment variable is not set');
    console.log('\nPlease set MONGODB_URI in your .env.local file:');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio');
    process.exit(1);
  }

  let client;

  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('   ✅ Connected successfully');

    const db = client.db(DB_NAME);
    console.log(`   📦 Using database: ${DB_NAME}`);

    // Run migrations
    await migrateAbout(db);
    await migrateContact(db);
    await migratePhotos(db);
    await migrateVideos(db);

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration completed successfully!');
    console.log('\nYour data has been migrated to MongoDB.');
    console.log('You can now deploy your application to Vercel.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run migration
migrate().catch(console.error);
