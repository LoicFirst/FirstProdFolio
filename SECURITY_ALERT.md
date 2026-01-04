# SECURITY ALERT - Credential Exposure Fixed

## Summary

**Date**: January 4, 2026  
**Severity**: CRITICAL  
**Status**: FIXED in commit c45c29c

## What Happened

During the migration from MongoDB to JSON storage, admin credentials were accidentally committed to the GitHub repository in plain text and hashed form.

## Exposed Information

The following sensitive information was exposed in commits d60fae5 through b67e0aa:

1. **Email**: `loicmazagran2007@gmail.com`
2. **Plain-text password**: `CRyTDXCGhADE4` (exposed in ADMIN_README.md)
3. **Bcrypt hash**: `$2b$10$VXrCb7vqpNjznoeiPs/SE.i1aF7p9d7C963dtvZZb.5fX2wcwyZFC`

### Files Affected

- `data.json` - Contained email and bcrypt hash
- `ADMIN_README.md` - Contained email and **plain-text password**
- `src/lib/db/json-db.ts` - Contained email in fallback code

## What We Fixed

### Commit c45c29c - Security Fix

1. ✅ Removed `data.json` from git tracking
2. ✅ Added `data.json` to `.gitignore`
3. ✅ Removed plain-text password from ADMIN_README.md
4. ✅ Removed email from source code
5. ✅ Created `data.json.example` as safe template
6. ✅ Created `SETUP.md` with secure setup instructions

## Immediate Actions Required

### For Repository Owner (@LoicFirst)

**🚨 URGENT - Change your password immediately:**

1. Generate a new bcrypt hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourNewSecurePassword', 10, (err, hash) => { console.log(hash); });"
   ```

2. Update your local `data.json`:
   ```json
   {
     "admin": {
       "email": "your-email@example.com",
       "password": "NEW_BCRYPT_HASH_HERE"
     }
   }
   ```

3. Update credentials on Vercel deployment

### Optional: Clean Git History

The credentials are still visible in old commits. To completely remove them from git history:

**Option 1: BFG Repo-Cleaner (Recommended)**
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive data
bfg --replace-text passwords.txt  # Create a file with the password to remove

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ This rewrites history!)
git push --force
```

**Option 2: Start Fresh (Easiest)**
1. Create a new empty repository
2. Copy current files (without .git folder)
3. Initialize new git history
4. Push to new repository

## Prevention Measures Implemented

1. ✅ `data.json` added to `.gitignore`
2. ✅ Template file (`data.json.example`) provided
3. ✅ Setup documentation created (SETUP.md)
4. ✅ Code no longer contains fallback credentials
5. ✅ Documentation updated to warn about credential security

## Best Practices Moving Forward

1. **Never commit credentials** - Always use `.gitignore` for sensitive files
2. **Use environment variables** - Store secrets in `.env.local` (already in .gitignore)
3. **Use strong passwords** - Generate random passwords with password managers
4. **Rotate credentials** - Change passwords immediately if exposed
5. **Review before commit** - Always check `git diff` before committing

## For New Users/Developers

If you're cloning this repository:

1. The `data.json` file will NOT be present (it's in .gitignore)
2. Copy `data.json.example` to `data.json`
3. Follow `SETUP.md` instructions to configure your own credentials
4. Never commit `data.json` to git

## Resources

- [SETUP.md](./SETUP.md) - Setup instructions
- [ADMIN_README.md](./ADMIN_README.md) - Admin documentation
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Note**: While the credentials are removed from future commits, they remain in the git history of commits d60fae5 through b67e0aa. Follow the "Clean Git History" section above if complete removal is required.
