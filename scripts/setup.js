#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('========================================');
console.log('🚀 Configuration automatique du portfolio');
console.log('========================================\n');

// Step 1: Copy data.json.example to data.json and set proper credentials
console.log('[SETUP] Étape 1: Configuration de data.json');
const dataJsonExamplePath = path.join(process.cwd(), 'data.json.example');
const dataJsonPath = path.join(process.cwd(), 'data.json');

if (!fs.existsSync(dataJsonExamplePath)) {
  console.error('[ERROR] ❌ Le fichier data.json.example est introuvable');
  process.exit(1);
}

if (fs.existsSync(dataJsonPath)) {
  console.log('[SETUP] ⚠️  data.json existe déjà, conservation du fichier existant');
} else {
  try {
    // Read the example file
    const exampleContent = fs.readFileSync(dataJsonExamplePath, 'utf-8');
    let data = JSON.parse(exampleContent);
    
    // Check if password needs to be hashed
    if (data.admin && data.admin.password && data.admin.password.includes('REPLACE_WITH_BCRYPT_HASH')) {
      console.log('[SETUP] 🔐 Configuration du mot de passe admin...');
      
      // Try to use bcrypt if available (during npm run setup)
      // During postinstall, bcrypt may not be installed yet
      try {
        const bcrypt = require('bcryptjs');
        const defaultPassword = 'CRyTDXCGhADE4';
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
        data.admin.password = hashedPassword;
        console.log('[SETUP] ✓ Mot de passe hashé généré avec bcrypt');
      } catch (bcryptError) {
        // Bcrypt not available, use pre-computed hash
        console.log('[SETUP] ℹ️  Utilisation du hash pré-calculé (bcrypt non disponible pendant postinstall)');
        data.admin.password = '$2b$10$3UR3vsM9IYKjysxqjzEje.vOgopIJzisqbIbaePnw7VeaGZt8oplC';
      }
    }
    
    // Write the configured data.json
    fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[SETUP] ✅ data.json créé avec succès depuis data.json.example');
    console.log('[SETUP] ℹ️  Identifiants admin configurés: ' + data.admin.email);
  } catch (error) {
    console.error('[ERROR] ❌ Impossible de copier data.json.example:', error.message);
    process.exit(1);
  }
}

// Step 2: Create or update .env file with JWT_SECRET
console.log('\n[SETUP] Étape 2: Configuration de JWT_SECRET');
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

let envContent = '';
let jwtSecretExists = false;

// Read existing .env.local if it exists
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
  jwtSecretExists = envContent.includes('JWT_SECRET=');
  console.log('[SETUP] ℹ️  .env.local existe déjà');
}

if (jwtSecretExists) {
  console.log('[SETUP] ⚠️  JWT_SECRET existe déjà dans .env.local, conservation de la valeur existante');
} else {
  // Generate a secure random JWT_SECRET
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  // Read .env.example if it exists to get other variables
  if (fs.existsSync(envExamplePath) && !envContent) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  }
  
  // Add or update JWT_SECRET
  if (envContent) {
    if (!envContent.includes('JWT_SECRET')) {
      envContent += `\n# JWT Secret for authentication\nJWT_SECRET=${jwtSecret}\n`;
    } else {
      envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`);
    }
  } else {
    envContent = `# JWT Secret for authentication\nJWT_SECRET=${jwtSecret}\n`;
  }
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('[SETUP] ✅ JWT_SECRET généré et ajouté à .env.local');
    console.log('[SETUP] ℹ️  JWT_SECRET (64 caractères): ' + jwtSecret.substring(0, 16) + '...');
  } catch (error) {
    console.error('[ERROR] ❌ Impossible de créer .env.local:', error.message);
    process.exit(1);
  }
}

// Step 3: Verify data.json structure
console.log('\n[SETUP] Étape 3: Vérification de la structure de data.json');
try {
  const dataContent = fs.readFileSync(dataJsonPath, 'utf-8');
  const data = JSON.parse(dataContent);
  
  if (!data.admin || !data.admin.email || !data.admin.password) {
    console.error('[ERROR] ❌ data.json est invalide: structure admin manquante ou incomplète');
    console.error('[ERROR] Structure requise: { "admin": { "email": "...", "password": "..." }, "projects": [] }');
    process.exit(1);
  }
  
  console.log('[SETUP] ✅ Structure de data.json validée');
  console.log('[SETUP] ℹ️  Email admin configuré:', data.admin.email);
  console.log('[SETUP] ℹ️  Nombre de projets:', data.projects?.length || 0);
} catch (error) {
  console.error('[ERROR] ❌ Erreur lors de la validation de data.json:', error.message);
  process.exit(1);
}

// Step 4: Summary
console.log('\n========================================');
console.log('✅ Configuration terminée avec succès!');
console.log('========================================\n');
console.log('📋 Résumé de la configuration:');
console.log('  ✓ data.json configuré avec identifiants admin');
console.log('  ✓ JWT_SECRET généré dans .env.local');
console.log('  ✓ Structure validée\n');
console.log('🎯 Prochaines étapes:');
console.log('  1. Démarrez le serveur: npm run dev');
console.log('  2. Accédez à /admin/login');
console.log('  3. Consultez les logs avec les préfixes:');
console.log('     [AUTH]    - Authentification');
console.log('     [JSON-DB] - Base de données JSON');
console.log('     [ERROR]   - Erreurs\n');
console.log('========================================\n');
