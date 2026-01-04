/**
 * MongoDB Atlas SQL Connection Test Script
 * 
 * This script establishes and tests a connection to MongoDB Atlas using the Atlas SQL interface.
 * It verifies authentication, network access, and SSL configuration.
 * 
 * Usage:
 *   node scripts/test-atlas-connection.js
 * 
 * Prerequisites:
 *   - MONGODB_ATLAS_URI environment variable must be set with credentials
 *   - MongoDB driver must be installed (npm install mongodb)
 *   - Network access must be configured in MongoDB Atlas
 * 
 * Connection String Format:
 *   mongodb://<username>:<password>@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin
 */

const { MongoClient } = require('mongodb');

// Try to load environment variables from .env files
try {
  require('dotenv').config({ path: '.env.local' });
  if (!process.env.MONGODB_ATLAS_URI) {
    require('dotenv').config(); // Falls back to .env
  }
} catch (error) {
  // dotenv not installed, will use process.env directly
  // This is fine for production environments where env vars are set directly
}

/**
 * Test MongoDB Atlas SQL connection
 */
async function testAtlasConnection() {
  console.log('🚀 MongoDB Atlas SQL Connection Test');
  console.log('='.repeat(70));
  console.log();

  // Check for connection URI
  const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
  
  if (!MONGODB_ATLAS_URI) {
    console.error('❌ Error: MONGODB_ATLAS_URI environment variable is not set');
    console.log();
    console.log('📝 Setup Instructions:');
    console.log('   1. Create or edit .env.local file in the project root');
    console.log('   2. Add the following line with your credentials:');
    console.log();
    console.log('   MONGODB_ATLAS_URI=mongodb://<username>:<password>@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin');
    console.log();
    console.log('   Replace <username> and <password> with your MongoDB Atlas credentials');
    console.log();
    console.log('📚 For detailed setup instructions, see: MONGODB_ATLAS_CONNECTION.md');
    console.log('='.repeat(70));
    process.exit(1);
  }

  // Mask password in logs
  const maskedUri = MONGODB_ATLAS_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('🔗 Connection String: ' + maskedUri);
  console.log();

  let client;

  try {
    // Step 1: Create MongoDB client
    console.log('⏳ Step 1: Creating MongoDB client...');
    client = new MongoClient(MONGODB_ATLAS_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    console.log('   ✅ Client created successfully');
    console.log();

    // Step 2: Connect to MongoDB Atlas
    console.log('⏳ Step 2: Connecting to MongoDB Atlas SQL endpoint...');
    await client.connect();
    console.log('   ✅ Connection established successfully');
    console.log();

    // Step 3: Verify connection
    console.log('⏳ Step 3: Verifying connection...');
    await client.db('admin').command({ ping: 1 });
    console.log('   ✅ Server responded to ping');
    console.log();

    // Step 4: List databases
    console.log('⏳ Step 4: Retrieving list of databases...');
    const adminDb = client.db('admin');
    const databasesList = await adminDb.admin().listDatabases();
    
    console.log('   ✅ Successfully retrieved database list');
    console.log();
    console.log('📊 Available Databases:');
    console.log('   ' + '-'.repeat(66));
    console.log(`   ${'Name'.padEnd(30)} | ${'Size'.padEnd(15)} | ${'Empty'}`);
    console.log('   ' + '-'.repeat(66));
    
    databasesList.databases.forEach(db => {
      const sizeInMB = (db.sizeOnDisk / (1024 * 1024)).toFixed(2);
      const isEmpty = db.empty ? 'Yes' : 'No';
      console.log(`   ${db.name.padEnd(30)} | ${(sizeInMB + ' MB').padEnd(15)} | ${isEmpty}`);
    });
    
    console.log('   ' + '-'.repeat(66));
    console.log(`   Total databases: ${databasesList.databases.length}`);
    console.log();

    // Step 5: Test specific database access
    console.log('⏳ Step 5: Testing access to myVirtualDatabase...');
    const virtualDb = client.db('myVirtualDatabase');
    const collections = await virtualDb.listCollections().toArray();
    
    console.log('   ✅ Database accessed successfully');
    console.log(`   📁 Collections in myVirtualDatabase: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Collections:');
      collections.forEach(col => {
        console.log(`      - ${col.name}`);
      });
    } else {
      console.log('   (No collections found - database may be empty)');
    }
    console.log();

    // Success summary
    console.log('='.repeat(70));
    console.log('✨ Connection Test Completed Successfully!');
    console.log('='.repeat(70));
    console.log();
    console.log('✅ All checks passed:');
    console.log('   • Authentication successful');
    console.log('   • SSL connection established');
    console.log('   • Network access configured correctly');
    console.log('   • Database access verified');
    console.log();
    console.log('🎉 Your MongoDB Atlas SQL connection is fully functional!');
    console.log();

  } catch (error) {
    console.log();
    console.log('='.repeat(70));
    console.error('❌ Connection Test Failed');
    console.log('='.repeat(70));
    console.log();
    
    // Detailed error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔴 Error Type: Server Selection Timeout');
      console.log();
      console.log('This error typically indicates one of the following issues:');
      console.log();
      console.log('1. ⚠️  Network Access Restriction');
      console.log('   • Your IP address may not be whitelisted in MongoDB Atlas');
      console.log('   • Solution: Add your IP to Network Access in MongoDB Atlas');
      console.log('   • For testing: Allow access from anywhere (0.0.0.0/0)');
      console.log();
      console.log('2. ⚠️  Incorrect Connection String');
      console.log('   • Verify the hostname and port are correct');
      console.log('   • Check for typos in the connection string');
      console.log();
      console.log('3. ⚠️  Network/Firewall Issues');
      console.log('   • Check your firewall settings');
      console.log('   • Verify you can access MongoDB Atlas from your network');
      
    } else if (error.name === 'MongoAuthenticationError' || error.message.includes('auth')) {
      console.error('🔴 Error Type: Authentication Failed');
      console.log();
      console.log('This error indicates invalid credentials:');
      console.log();
      console.log('1. ⚠️  Incorrect Username or Password');
      console.log('   • Verify your MongoDB Atlas username');
      console.log('   • Check that your password is correct');
      console.log('   • Ensure special characters in password are URL-encoded');
      console.log();
      console.log('2. ⚠️  Authentication Source');
      console.log('   • Verify authSource=admin is in the connection string');
      console.log('   • Check that the user has proper database permissions');
      console.log();
      console.log('3. ⚠️  User Not Created or Deleted');
      console.log('   • Verify the database user exists in MongoDB Atlas');
      console.log('   • Go to Database Access in MongoDB Atlas to check');
      
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('🔴 Error Type: SSL/TLS Connection Error');
      console.log();
      console.log('This error indicates an SSL configuration issue:');
      console.log();
      console.log('1. ⚠️  SSL Required but Not Enabled');
      console.log('   • Ensure ssl=true is in the connection string');
      console.log('   • MongoDB Atlas requires SSL/TLS connections');
      console.log();
      console.log('2. ⚠️  Certificate Validation Issues');
      console.log('   • Check your system\'s SSL certificates are up to date');
      console.log('   • Ensure your Node.js version supports modern TLS');
      
    } else {
      console.error('🔴 Error Type: Unknown Error');
      console.log();
      console.log('An unexpected error occurred:');
    }
    
    console.log();
    console.log('📋 Error Details:');
    console.log('   Error Name:', error.name);
    console.log('   Error Message:', error.message);
    
    if (error.stack) {
      console.log();
      console.log('Stack Trace:');
      console.log(error.stack);
    }
    
    console.log();
    console.log('='.repeat(70));
    console.log('📚 For detailed troubleshooting, see: MONGODB_ATLAS_CONNECTION.md');
    console.log('='.repeat(70));
    
    process.exit(1);
    
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
      console.log();
    }
  }
}

// Run the test
testAtlasConnection().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
