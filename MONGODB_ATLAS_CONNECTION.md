# MongoDB Atlas SQL Connection Guide

This guide provides comprehensive instructions for establishing and testing a connection to MongoDB Atlas using the Atlas SQL interface.

## 🎯 Overview

This project includes a dedicated test script to verify your MongoDB Atlas SQL connection. The script handles authentication, SSL configuration, and provides detailed error messages to help troubleshoot any issues.

**Connection Endpoint:**
```
mongodb://atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase
```

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ A MongoDB Atlas account (free tier is sufficient)
2. ✅ Node.js and npm installed
3. ✅ Project dependencies installed (`npm install`)
4. ✅ MongoDB driver installed (included in project dependencies)

## 🚀 Quick Start

### Step 1: Configure Environment Variables

Create or edit the `.env.local` file in the project root:

```bash
# MongoDB Atlas SQL Connection
MONGODB_ATLAS_URI=mongodb://<username>:<password>@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin
```

**Replace:**
- `<username>` with your MongoDB Atlas database username
- `<password>` with your MongoDB Atlas database password

**Important:** If your password contains special characters, they must be URL-encoded:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

### Step 2: Run the Connection Test

```bash
node scripts/test-atlas-connection.js
```

### Step 3: Verify Success

You should see output similar to:

```
🚀 MongoDB Atlas SQL Connection Test
======================================================================

🔗 Connection String: mongodb://username:****@atlas-sql-...

⏳ Step 1: Creating MongoDB client...
   ✅ Client created successfully

⏳ Step 2: Connecting to MongoDB Atlas SQL endpoint...
   ✅ Connection established successfully

⏳ Step 3: Verifying connection...
   ✅ Server responded to ping

⏳ Step 4: Retrieving list of databases...
   ✅ Successfully retrieved database list

📊 Available Databases:
   ------------------------------------------------------------------
   Name                           | Size            | Empty
   ------------------------------------------------------------------
   admin                          | 0.00 MB         | Yes
   myVirtualDatabase              | 0.05 MB         | No
   ------------------------------------------------------------------
   Total databases: 2

⏳ Step 5: Testing access to myVirtualDatabase...
   ✅ Database accessed successfully
   📁 Collections in myVirtualDatabase: 0

======================================================================
✨ Connection Test Completed Successfully!
======================================================================

✅ All checks passed:
   • Authentication successful
   • SSL connection established
   • Network access configured correctly
   • Database access verified

🎉 Your MongoDB Atlas SQL connection is fully functional!
```

## 🔧 MongoDB Atlas Configuration

### 1. Create Database User

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** in the left sidebar
3. Click **Add New Database User**
4. Configure the user:
   - **Authentication Method:** Password
   - **Username:** Choose a username (e.g., `atlasUser`)
   - **Password:** Generate a secure password or create your own
   - **Database User Privileges:** Select "Atlas admin" or "Read and write to any database"
5. Click **Add User**

**Important:** Save your username and password securely - you'll need them for the connection string.

### 2. Configure Network Access

1. Navigate to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Choose one of the following options:

   **Option A: Allow Your Current IP (Recommended for Development)**
   - Click **Add Current IP Address**
   - Your IP will be automatically detected and added
   
   **Option B: Allow Access from Anywhere (For Testing/Deployment)**
   - Click **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` to the whitelist
   - ⚠️ Use with caution in production
   
   **Option C: Add Specific IP Range**
   - Enter a specific IP address or CIDR range
   - Useful for restricting access to specific networks

4. Click **Confirm**

**Note:** Network access changes may take up to 2 minutes to take effect.

### 3. Get Connection String

The connection string for this project is already provided:

```
mongodb://atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase
```

You only need to add your credentials in the format:
```
mongodb://<username>:<password>@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin
```

## 🐛 Troubleshooting

### Error: "MONGODB_ATLAS_URI environment variable is not set"

**Problem:** The connection string is not configured in environment variables.

**Solution:**
1. Create `.env.local` file in the project root
2. Add the line: `MONGODB_ATLAS_URI=mongodb://...`
3. Ensure the file is saved
4. Restart your terminal/application

### Error: "Server Selection Timeout" / "MongoServerSelectionError"

**Problem:** Cannot connect to MongoDB Atlas server.

**Common Causes:**

1. **Network Access Not Configured**
   - Your IP address is not whitelisted in MongoDB Atlas
   - **Solution:** Add your IP address in Network Access settings
   - For testing: Add `0.0.0.0/0` (allow from anywhere)

2. **Incorrect Hostname**
   - The connection string hostname is wrong
   - **Solution:** Verify the hostname matches your Atlas SQL endpoint
   - Expected format: `atlas-sql-[cluster-id].a.query.mongodb.net`

3. **Firewall Blocking Connection**
   - Your local firewall or corporate network blocks MongoDB ports
   - **Solution:** Check firewall settings, try from a different network
   - MongoDB uses port 27017 by default

4. **VPN/Proxy Issues**
   - VPN or proxy interfering with connection
   - **Solution:** Try disconnecting VPN or adjusting proxy settings

### Error: "Authentication failed" / "MongoAuthenticationError"

**Problem:** Username or password is incorrect.

**Common Causes:**

1. **Wrong Credentials**
   - Username or password doesn't match MongoDB Atlas user
   - **Solution:** Double-check credentials in Database Access
   - Verify username and password are correct

2. **Special Characters in Password**
   - Password contains unencoded special characters
   - **Solution:** URL-encode special characters in the password
   - Example: `P@ssw0rd!` becomes `P%40ssw0rd%21`

3. **Wrong Authentication Database**
   - Using wrong `authSource` parameter
   - **Solution:** Ensure connection string includes `authSource=admin`
   - MongoDB Atlas requires admin authentication source

4. **User Doesn't Exist**
   - Database user was deleted or never created
   - **Solution:** Go to Database Access in MongoDB Atlas and verify user exists

### Error: "SSL/TLS Connection Error"

**Problem:** SSL handshake failed.

**Common Causes:**

1. **SSL Not Enabled**
   - Connection string missing `ssl=true` parameter
   - **Solution:** Add `?ssl=true` to connection string
   - MongoDB Atlas requires SSL connections

2. **Outdated Node.js**
   - Node.js version doesn't support modern TLS
   - **Solution:** Update Node.js to version 14+ (LTS recommended)

3. **System Certificate Issues**
   - System SSL certificates are outdated
   - **Solution:** Update system certificates
   - On Ubuntu/Debian: `sudo apt-get update && sudo apt-get install ca-certificates`

### Connection String Format Errors

**Problem:** Malformed connection string.

**Common Issues:**

1. **Missing Protocol**
   - Must start with `mongodb://`
   - Not `https://` or `http://`

2. **Incorrect Format**
   - Correct format: `mongodb://username:password@host/database?options`
   - Ensure credentials come before `@` symbol

3. **Missing Required Parameters**
   - Must include: `ssl=true` and `authSource=admin`
   - Complete example:
     ```
     mongodb://user:pass@host/db?ssl=true&authSource=admin
     ```

## 🔒 Security Best Practices

### 1. Never Commit Credentials

- ❌ **Never** commit `.env.local` to version control
- ❌ **Never** commit hardcoded credentials in code
- ✅ Always use environment variables for credentials
- ✅ Use `.env.example` for templates without actual values

### 2. Use Strong Passwords

- Generate strong, random passwords for database users
- Use a password manager to store credentials securely
- Avoid common passwords or easily guessable patterns

### 3. Restrict Network Access

- In production, whitelist only necessary IP addresses
- Avoid using `0.0.0.0/0` (allow from anywhere) in production
- Use VPC peering for enhanced security if available

### 4. Grant Minimum Required Privileges

- Create users with only the permissions they need
- Avoid using "Atlas admin" role if not necessary
- Use "Read and write to any database" for application users
- Use "Read only" for analytics or reporting users

### 5. Rotate Credentials Regularly

- Change database passwords periodically
- Update connection strings in all environments
- Revoke access for users who no longer need it

## 📝 Script Usage in Application

Once the connection is verified, you can use the same connection pattern in your application:

```javascript
const { MongoClient } = require('mongodb');

// Load from environment variables
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_ATLAS_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  
  await client.connect();
  const db = client.db('myVirtualDatabase');
  
  // Use the database
  const collections = await db.listCollections().toArray();
  console.log('Available collections:', collections);
  
  return { client, db };
}
```

## 🔄 Integration with Existing Migration Script

This project already includes a migration script (`scripts/migrate-to-mongodb.js`) that can work with either:

1. **Standard MongoDB Atlas connection** (for regular collections)
2. **MongoDB Atlas SQL connection** (for SQL-like interface)

To use the Atlas SQL connection for migrations, update your `.env.local`:

```bash
# For regular MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# For MongoDB Atlas SQL (new)
MONGODB_ATLAS_URI=mongodb://username:password@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin
```

## 📊 Expected Output Examples

### Successful Connection

```
✨ Connection Test Completed Successfully!
✅ All checks passed:
   • Authentication successful
   • SSL connection established
   • Network access configured correctly
   • Database access verified
```

### Available Databases List

```
📊 Available Databases:
   ------------------------------------------------------------------
   Name                           | Size            | Empty
   ------------------------------------------------------------------
   admin                          | 0.00 MB         | Yes
   config                         | 0.00 MB         | Yes
   local                          | 0.00 MB         | Yes
   myVirtualDatabase              | 2.34 MB         | No
   portfolio                      | 5.67 MB         | No
   ------------------------------------------------------------------
   Total databases: 5
```

## 🎓 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Atlas SQL Documentation](https://www.mongodb.com/docs/atlas/data-federation/query/sql/)

## 💡 Tips

1. **Start with Test Script:** Always run the test script before integrating into your application
2. **Check Logs:** The test script provides detailed logs for each step
3. **Verify Network Access:** Most connection issues are related to Network Access settings
4. **URL-Encode Passwords:** Special characters must be encoded in the connection string
5. **Use Strong Authentication:** Enable MFA for your MongoDB Atlas account
6. **Monitor Usage:** Check MongoDB Atlas metrics to monitor database usage

## 🆘 Still Having Issues?

If you continue to experience problems:

1. **Review the Error Message:** The test script provides detailed error analysis
2. **Check MongoDB Atlas Status:** Visit [status.mongodb.com](https://status.mongodb.com/)
3. **Verify Prerequisites:** Ensure all prerequisites are met
4. **Try Different Network:** Test from a different network to rule out firewall issues
5. **Contact Support:** Reach out to MongoDB Atlas support if needed

---

**Last Updated:** 2026-01-04  
**Version:** 1.0.0
