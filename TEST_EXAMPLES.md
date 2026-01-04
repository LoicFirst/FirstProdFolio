# MongoDB Atlas Connection - Test Examples

This document provides examples of running the connection test script and interpreting the results.

## Running the Test Script

### Method 1: Using npm script (Recommended)

```bash
npm run test:atlas
```

### Method 2: Using Node directly

```bash
node scripts/test-atlas-connection.js
```

### Method 3: With inline environment variable

```bash
MONGODB_ATLAS_URI="mongodb://username:password@host/db?ssl=true&authSource=admin" npm run test:atlas
```

## Test Scenarios and Expected Outputs

### Scenario 1: Missing Environment Variable

**Command:**
```bash
npm run test:atlas
```

**Expected Output:**
```
🚀 MongoDB Atlas SQL Connection Test
======================================================================

❌ Error: MONGODB_ATLAS_URI environment variable is not set

📝 Setup Instructions:
   1. Create or edit .env.local file in the project root
   2. Add the following line with your credentials:

   MONGODB_ATLAS_URI=mongodb://<username>:<password>@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin

   Replace <username> and <password> with your MongoDB Atlas credentials

📚 For detailed setup instructions, see: MONGODB_ATLAS_CONNECTION.md
======================================================================
```

**What this means:**
- The `MONGODB_ATLAS_URI` environment variable is not configured
- You need to create a `.env.local` file with your connection string

### Scenario 2: Successful Connection

**Setup:**
1. Configure `.env.local` with valid credentials
2. Ensure MongoDB Atlas Network Access allows your IP

**Expected Output:**
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

🔌 Connection closed
```

**What this means:**
- ✅ Authentication successful - credentials are correct
- ✅ Network access is properly configured
- ✅ SSL connection is working
- ✅ You can access the database and retrieve information

### Scenario 3: Authentication Failed

**Setup:**
- Connection string with incorrect username or password

**Expected Output:**
```
🚀 MongoDB Atlas SQL Connection Test
======================================================================

🔗 Connection String: mongodb://wronguser:****@atlas-sql-...

⏳ Step 1: Creating MongoDB client...
   ✅ Client created successfully

⏳ Step 2: Connecting to MongoDB Atlas SQL endpoint...

======================================================================
❌ Connection Test Failed
======================================================================

🔴 Error Type: Authentication Failed

This error indicates invalid credentials:

1. ⚠️  Incorrect Username or Password
   • Verify your MongoDB Atlas username
   • Check that your password is correct
   • Ensure special characters in password are URL-encoded

2. ⚠️  Authentication Source
   • Verify authSource=admin is in the connection string
   • Check that the user has proper database permissions

3. ⚠️  User Not Created or Deleted
   • Verify the database user exists in MongoDB Atlas
   • Go to Database Access in MongoDB Atlas to check

📋 Error Details:
   Error Name: MongoAuthenticationError
   Error Message: Authentication failed.
```

**Action Required:**
1. Verify your username and password in MongoDB Atlas
2. Check Database Access settings in MongoDB Atlas
3. Ensure your password is properly URL-encoded if it contains special characters

### Scenario 4: Network Access Restricted

**Setup:**
- Valid credentials but IP address not whitelisted in MongoDB Atlas

**Expected Output:**
```
🚀 MongoDB Atlas SQL Connection Test
======================================================================

🔗 Connection String: mongodb://username:****@atlas-sql-...

⏳ Step 1: Creating MongoDB client...
   ✅ Client created successfully

⏳ Step 2: Connecting to MongoDB Atlas SQL endpoint...

======================================================================
❌ Connection Test Failed
======================================================================

🔴 Error Type: Server Selection Timeout

This error typically indicates one of the following issues:

1. ⚠️  Network Access Restriction
   • Your IP address may not be whitelisted in MongoDB Atlas
   • Solution: Add your IP to Network Access in MongoDB Atlas
   • For testing: Allow access from anywhere (0.0.0.0/0)

2. ⚠️  Incorrect Connection String
   • Verify the hostname and port are correct
   • Check for typos in the connection string

3. ⚠️  Network/Firewall Issues
   • Check your firewall settings
   • Verify you can access MongoDB Atlas from your network

📋 Error Details:
   Error Name: MongoServerSelectionError
   Error Message: connection timed out
```

**Action Required:**
1. Log in to MongoDB Atlas
2. Go to Network Access
3. Add your current IP address or use `0.0.0.0/0` for testing
4. Wait 1-2 minutes for changes to take effect
5. Run the test again

### Scenario 5: SSL Connection Error

**Setup:**
- Connection string missing `ssl=true` parameter

**Expected Output:**
```
🚀 MongoDB Atlas SQL Connection Test
======================================================================

🔗 Connection String: mongodb://username:****@atlas-sql-...

⏳ Step 1: Creating MongoDB client...
   ✅ Client created successfully

⏳ Step 2: Connecting to MongoDB Atlas SQL endpoint...

======================================================================
❌ Connection Test Failed
======================================================================

🔴 Error Type: SSL/TLS Connection Error

This error indicates an SSL configuration issue:

1. ⚠️  SSL Required but Not Enabled
   • Ensure ssl=true is in the connection string
   • MongoDB Atlas requires SSL/TLS connections

2. ⚠️  Certificate Validation Issues
   • Check your system's SSL certificates are up to date
   • Ensure your Node.js version supports modern TLS

📋 Error Details:
   Error Name: MongoTLSError
   Error Message: SSL connection failed
```

**Action Required:**
1. Ensure your connection string includes `?ssl=true`
2. Update Node.js if using an old version
3. Check system SSL certificates are up to date

## Verifying Your Setup

### Quick Verification Checklist

Before running the test, verify:

- [ ] `.env.local` file exists in project root
- [ ] `MONGODB_ATLAS_URI` is set in `.env.local`
- [ ] Connection string includes `ssl=true`
- [ ] Connection string includes `authSource=admin`
- [ ] Username and password are correct
- [ ] Special characters in password are URL-encoded
- [ ] IP address is whitelisted in MongoDB Atlas Network Access

### Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure connection string:**
   Create `.env.local`:
   ```bash
   MONGODB_ATLAS_URI=mongodb://myuser:mypassword@atlas-sql-6959724260038430294a9b68-sg9f5j.a.query.mongodb.net/myVirtualDatabase?ssl=true&authSource=admin
   ```

3. **Run the test:**
   ```bash
   npm run test:atlas
   ```

4. **Check the output:**
   - If successful, you'll see all ✅ checkmarks
   - If failed, follow the error-specific instructions

## Advanced Usage

### Testing Multiple Environments

You can test different connection strings by temporarily setting the environment variable:

```bash
# Test production connection
MONGODB_ATLAS_URI="mongodb://prod_user:prod_pass@prod-host/db?ssl=true&authSource=admin" npm run test:atlas

# Test development connection
MONGODB_ATLAS_URI="mongodb://dev_user:dev_pass@dev-host/db?ssl=true&authSource=admin" npm run test:atlas
```

### Debugging Connection Issues

Add verbose logging by modifying the script temporarily or checking the full stack trace in the output.

### Integration with CI/CD

You can use this script in CI/CD pipelines to verify database connectivity:

```yaml
# Example GitHub Actions workflow
- name: Test MongoDB Atlas Connection
  env:
    MONGODB_ATLAS_URI: ${{ secrets.MONGODB_ATLAS_URI }}
  run: npm run test:atlas
```

## Common Issues and Solutions

### Issue: "Module not found: mongodb"

**Solution:** Install dependencies first:
```bash
npm install
```

### Issue: "Permission denied"

**Solution:** Ensure script has execute permissions:
```bash
chmod +x scripts/test-atlas-connection.js
```

### Issue: "Cannot read .env.local"

**Solution:** Ensure file exists and has correct syntax:
```bash
# Check if file exists
ls -la .env.local

# View file contents
cat .env.local
```

### Issue: "Connection works locally but not in production"

**Solution:** 
1. Verify environment variables are set in production
2. Ensure production IP is whitelisted in MongoDB Atlas
3. Check that connection string is correctly configured in production environment

## Next Steps

After successful connection test:

1. ✅ Use the same connection pattern in your application code
2. ✅ Migrate existing data using `npm run migrate:mongodb`
3. ✅ Deploy to production with confidence
4. ✅ Monitor database usage in MongoDB Atlas dashboard

## Resources

- [MongoDB Atlas Connection Guide](MONGODB_ATLAS_CONNECTION.md) - Full documentation
- [MongoDB Atlas Dashboard](https://cloud.mongodb.com/) - Manage your database
- [MongoDB Node.js Driver Docs](https://mongodb.github.io/node-mongodb-native/) - Driver documentation

---

**Last Updated:** 2026-01-04
