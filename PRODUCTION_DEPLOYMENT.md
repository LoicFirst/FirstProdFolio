# Production Deployment Guide

## ⚠️ Important: Filesystem Limitations in Production

This application currently uses **file-based storage** (JSON files) which works perfectly in local development but has limitations in production serverless environments like Vercel.

### The Problem

When deployed to serverless platforms (Vercel, Netlify, AWS Lambda, etc.):
- **The filesystem is READ-ONLY** - you cannot write to files
- Any changes made via the admin interface will fail with "Erreur lors de l'enregistrement" error
- Even if writes temporarily succeed (e.g., to `/tmp`), changes don't persist across function invocations

### Current Status

✅ **Local Development**: Fully functional - data is saved to JSON files  
❌ **Production (Vercel)**: Admin can view data but **cannot save changes**  

The application now detects read-only filesystems and provides clear error messages to help diagnose the issue.

## Solutions for Production

You have several options to enable data persistence in production:

### Option 1: Use Vercel Blob Storage (Recommended)

Vercel Blob provides persistent file storage that works in serverless environments.

**Pros:**
- Easy integration with Vercel
- No infrastructure management
- Minimal code changes

**Cons:**
- Requires Vercel Pro plan
- Vendor lock-in

**Setup:**
```bash
npm install @vercel/blob
```

See: https://vercel.com/docs/storage/vercel-blob

### Option 2: Use Vercel KV (Redis)

Vercel KV provides a Redis-compatible key-value store.

**Pros:**
- Fast performance
- Built for serverless
- Good for frequently changing data

**Cons:**
- Requires refactoring from JSON files
- Vercel Pro plan required

**Setup:**
```bash
npm install @vercel/kv
```

See: https://vercel.com/docs/storage/vercel-kv

### Option 3: Use an External Database

Use MongoDB, PostgreSQL, or other database service.

**Pros:**
- Production-ready
- More control and features
- Works with any hosting platform

**Cons:**
- More setup required
- Additional cost
- Need to refactor storage layer

**Popular Options:**
- MongoDB Atlas (free tier available): https://www.mongodb.com/cloud/atlas
- Supabase (PostgreSQL, free tier): https://supabase.com/
- PlanetScale (MySQL, free tier): https://planetscale.com/

### Option 4: Git-Based Storage (GitHub as CMS)

Use GitHub API to commit changes back to the repository.

**Pros:**
- Free
- Version control built-in
- Works with any static hosting

**Cons:**
- Slower (triggers rebuild)
- More complex setup
- Rate limits

### Option 5: Deploy to a Platform with Writable Filesystem

Use a traditional hosting platform instead of serverless.

**Options:**
- Railway: https://railway.app/
- Render: https://render.com/
- DigitalOcean App Platform: https://www.digitalocean.com/products/app-platform
- AWS EC2 / Lightsail
- Any VPS (Virtual Private Server)

**Pros:**
- No code changes needed
- Traditional server environment
- Persistent filesystem

**Cons:**
- Less scalable than serverless
- More expensive
- Requires server management

## Implementation Guide

### For Local Development (Already Working)

No changes needed! Your local development environment has a writable filesystem.

### For Production (Choose One Solution Above)

The codebase is structured to make it easy to swap storage backends. All file operations go through:
- `src/lib/filesystem.ts` - Filesystem operations
- `src/lib/db/json-db.ts` - Data access layer
- `src/app/api/admin/*/route.ts` - API endpoints

To implement a storage solution:
1. Create a new storage adapter (e.g., `src/lib/storage/vercel-blob.ts`)
2. Update API routes to use the new adapter
3. Set required environment variables
4. Deploy and test

## Environment Variables

Add these to your Vercel project settings or `.env.local`:

```bash
# Required
JWT_SECRET=your-secret-here

# For Vercel Blob (Option 1)
BLOB_READ_WRITE_TOKEN=your-token-here

# For Vercel KV (Option 2)
KV_URL=your-kv-url
KV_REST_API_URL=your-api-url
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-read-token

# For MongoDB (Option 3)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# For GitHub Storage (Option 4)
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_REPO=username/repo-name
```

## Testing the Fix

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Login to admin: http://localhost:3000/admin/login

3. Try to save changes - should work ✅

### Production Testing

1. Deploy to Vercel

2. Try to save changes:
   - **Without storage solution**: Will show clear error message explaining the issue
   - **With storage solution**: Should work ✅

## Error Messages

The application now provides helpful error messages:

**When filesystem is read-only:**
```
❌ Erreur: Système de fichiers en lecture seule

Le système de fichiers est en lecture seule dans cet environnement 
(courant pour les déploiements serverless comme Vercel).

Pour activer la persistance des données en production, vous devez 
configurer une base de données ou un service de stockage externe.

Documentation: https://vercel.com/docs/storage
```

**In server logs:**
```
[FILESYSTEM] ❌ Read-only filesystem error
[API] ❌ READ-ONLY FILESYSTEM DETECTED
[API] This is common in serverless environments like Vercel
```

## Quick Start for Production

**Fastest path to production (5 minutes):**

1. **Switch to a VPS hosting** (Option 5):
   - Deploy to Railway or Render
   - Both have free tiers
   - No code changes needed

2. **Or use MongoDB** (Option 3):
   - Sign up for MongoDB Atlas free tier
   - Get connection string
   - Add to environment variables
   - The app will auto-detect and use it

## Support

For questions about:
- **Storage options**: See Vercel documentation https://vercel.com/docs/storage
- **Database setup**: See provider-specific documentation
- **Code issues**: Check server logs in Vercel dashboard

## Summary

📝 **Current State**: App works locally but cannot save in production (Vercel serverless)  
🎯 **Goal**: Enable data persistence in production  
✅ **Quick Fix**: Deploy to Railway/Render instead of Vercel  
🔧 **Better Fix**: Integrate Vercel Blob or a database  

The application now provides **clear error detection and helpful messages** to guide you through fixing the production deployment issue.
