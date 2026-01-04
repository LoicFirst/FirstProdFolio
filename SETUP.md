# Setup Instructions

## Initial Setup

### 1. Create data.json file

Copy the example file and configure your admin credentials:

```bash
cp data.json.example data.json
```

### 2. Generate a bcrypt hash for your password

Use this command to generate a secure hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourSecurePassword', 10, (err, hash) => { console.log(hash); });"
```

### 3. Update data.json

Edit `data.json` with your email and the generated bcrypt hash:

```json
{
  "projects": [],
  "admin": {
    "email": "your-admin-email@example.com",
    "password": "$2b$10$YOUR_GENERATED_BCRYPT_HASH_HERE"
  }
}
```

### 4. Set up JWT_SECRET environment variable

Generate a secure secret:

```bash
openssl rand -base64 32
```

Add to `.env.local`:

```
JWT_SECRET=<your-generated-secret>
```

## Security Notes

⚠️ **IMPORTANT**:
- **Never commit `data.json` to git** - it contains your credentials
- The `data.json` file is already in `.gitignore`
- Always use strong, unique passwords
- Keep your JWT_SECRET secure and never commit it

## For Deployment (Vercel/Production)

1. Upload `data.json` directly to your deployment environment (not via git)
2. Set `JWT_SECRET` as an environment variable in your deployment platform
3. Ensure `NODE_ENV=production` is set

## Troubleshooting

If you see "data.json file not found" error:
1. Make sure you've created `data.json` from `data.json.example`
2. Verify the file is in the root directory of the project
3. Check that the file contains valid JSON

For more details, see `ADMIN_README.md`.
