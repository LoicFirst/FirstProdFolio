#!/usr/bin/env node

/**
 * Script de test de connexion MongoDB
 * 
 * Ce script aide à diagnostiquer les problèmes de connexion MongoDB
 * en testant la connexion et en fournissant des messages d'erreur détaillés.
 * 
 * Usage: node scripts/test-mongodb-connection.js
 * 
 * Assurez-vous d'avoir configuré MONGODB_URI dans votre fichier .env.local
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Fonction pour charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local introuvable');
    console.error('📝 Créez un fichier .env.local à la racine du projet');
    console.error('📋 Copiez le contenu de .env.example et remplissez vos valeurs');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  
  return true;
}

// Fonction de validation de l'URI MongoDB (similaire à celle du code TypeScript)
function validateMongoDBUri(uri) {
  if (!uri || uri.trim().length === 0) {
    return {
      isValid: false,
      error: 'La variable MONGODB_URI est vide ou ne contient que des espaces.'
    };
  }

  const MONGODB_PROTOCOL_REGEX = /^mongodb(\+srv)?:\/\//;

  if (!MONGODB_PROTOCOL_REGEX.test(uri)) {
    return {
      isValid: false,
      error: 'MONGODB_URI doit commencer par "mongodb://" ou "mongodb+srv://".'
    };
  }

  const parts = uri.split('@');
  const hasCredentials = parts.length > 1;
  
  if (hasCredentials) {
    const lastAtIndex = uri.lastIndexOf('@');
    const credentialsPart = uri.substring(0, lastAtIndex);
    const protocolRemoved = credentialsPart.replace(MONGODB_PROTOCOL_REGEX, '');
    
    if (!protocolRemoved || protocolRemoved.trim().length === 0) {
      return {
        isValid: false,
        error: 'Les identifiants MongoDB sont manquants.'
      };
    }
    
    if (!protocolRemoved.includes(':')) {
      return {
        isValid: false,
        error: 'Format des identifiants invalide. Un ":" doit séparer le nom d\'utilisateur et le mot de passe.'
      };
    }

    const [username, ...passwordParts] = protocolRemoved.split(':');
    const password = passwordParts.join(':');
    
    if (!username || username.trim().length === 0) {
      return {
        isValid: false,
        error: 'Le nom d\'utilisateur MongoDB est manquant.'
      };
    }
    
    if (!password || password.trim().length === 0) {
      return {
        isValid: false,
        error: 'Le mot de passe MongoDB est manquant.'
      };
    }

    if (protocolRemoved.includes('<') || protocolRemoved.includes('>')) {
      return {
        isValid: false,
        error: 'MONGODB_URI contient un mot de passe de substitution (ex: <password>).'
      };
    }
    
    const lowerPassword = password.toLowerCase();
    const exactPlaceholderPatterns = [
      'password', 'your_password', 'yourpassword', 'your-password',
      'changeme', 'change_me', 'temp', 'test', '123456', '12345678',
      'admin', 'root', 'demo'
    ];
    
    // Only reject if password matches common placeholders EXACTLY (case insensitive)
    if (exactPlaceholderPatterns.includes(lowerPassword)) {
      return {
        isValid: false,
        error: 'Le mot de passe semble être un placeholder.'
      };
    }
    
    const hostPart = uri.substring(lastAtIndex + 1);
    if (!hostPart || hostPart.trim().length === 0) {
      return {
        isValid: false,
        error: 'L\'adresse du cluster MongoDB est manquante.'
      };
    }
    
    const hostOnly = hostPart.split('/')[0].split('?')[0];
    if (!hostOnly.includes('.')) {
      return {
        isValid: false,
        error: 'L\'adresse du cluster semble invalide (doit contenir un nom de domaine).'
      };
    }
  }

  return { isValid: true };
}

// Fonction principale de test
async function testConnection() {
  console.log('🔍 Test de connexion MongoDB\n');
  console.log('═'.repeat(60));
  
  // Étape 1: Charger les variables d'environnement
  console.log('\n📂 Étape 1: Chargement des variables d\'environnement');
  if (!loadEnvFile()) {
    process.exit(1);
  }
  console.log('✅ Fichier .env.local chargé');

  // Étape 2: Vérifier la présence de MONGODB_URI
  console.log('\n🔑 Étape 2: Vérification de MONGODB_URI');
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI est manquant dans .env.local');
    console.error('\n📝 Ajoutez cette ligne dans .env.local:');
    console.error('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName');
    process.exit(1);
  }
  
  // Masquer partiellement l'URI pour la sécurité
  let maskedUri;
  try {
    maskedUri = MONGODB_URI.replace(/(:\/\/)([^:]+):([^@]+)(@)/, '$1***:***$4');
  } catch (error) {
    // If masking fails, just show a generic message
    maskedUri = 'mongodb+srv://***:***@***';
  }
  console.log('✅ MONGODB_URI trouvé:', maskedUri);

  // Étape 3: Valider le format
  console.log('\n✓ Étape 3: Validation du format');
  const validation = validateMongoDBUri(MONGODB_URI);
  
  if (!validation.isValid) {
    console.error('❌ Format invalide:', validation.error);
    console.error('\n📝 Format attendu:');
    console.error('mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName');
    process.exit(1);
  }
  console.log('✅ Format valide');

  // Étape 4: Tester la connexion
  console.log('\n🔌 Étape 4: Test de connexion au serveur MongoDB');
  console.log('⏳ Connexion en cours...');
  
  try {
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Connexion réussie!');
    console.log(`⏱️  Temps de connexion: ${duration}ms`);
    console.log('📊 Informations de connexion:');
    console.log(`   - Nom de la base: ${mongoose.connection.name || 'default'}`);
    console.log(`   - État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'État inconnu'}`);
    console.log(`   - Hôte: ${mongoose.connection.host || 'N/A'}`);
    
    // Tester une opération basique
    console.log('\n📝 Étape 5: Test d\'opération de base');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Collections trouvées: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   Collections:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Déconnexion réussie');
    
    console.log('\n═'.repeat(60));
    console.log('🎉 Tous les tests sont passés avec succès!');
    console.log('✅ Votre configuration MongoDB est correcte');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Échec de connexion');
    console.error('═'.repeat(60));
    
    if (error.message.includes('authentication failed') || error.message.includes('auth failed')) {
      console.error('\n🔐 Problème d\'authentification');
      console.error('Causes possibles:');
      console.error('  1. Nom d\'utilisateur incorrect');
      console.error('  2. Mot de passe incorrect');
      console.error('  3. L\'utilisateur n\'a pas les permissions nécessaires');
      console.error('\n💡 Solutions:');
      console.error('  - Vérifiez vos identifiants dans MongoDB Atlas (Database Access)');
      console.error('  - Assurez-vous que le mot de passe ne contient pas de caractères spéciaux non encodés');
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n🌐 Serveur MongoDB introuvable');
      console.error('Causes possibles:');
      console.error('  1. Adresse du cluster incorrecte');
      console.error('  2. Le cluster n\'existe pas ou a été supprimé');
      console.error('  3. Problème DNS');
      console.error('\n💡 Solutions:');
      console.error('  - Vérifiez l\'adresse dans MongoDB Atlas (Database > Connect)');
      console.error('  - Copiez la chaîne de connexion exacte depuis Atlas');
      
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      console.error('\n⏱️  Délai de connexion expiré');
      console.error('Causes possibles:');
      console.error('  1. Liste blanche IP mal configurée');
      console.error('  2. Problème de réseau/firewall');
      console.error('  3. Le cluster est en pause (comptes gratuits inactifs)');
      console.error('\n💡 Solutions:');
      console.error('  - Ajoutez 0.0.0.0/0 à la liste blanche dans MongoDB Atlas (Network Access)');
      console.error('  - Vérifiez que le cluster est actif dans Atlas');
      console.error('  - Attendez 2-3 minutes après modification de la liste blanche');
      
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔌 Impossible de joindre le serveur MongoDB');
      console.error('Causes possibles:');
      console.error('  1. Configuration réseau incorrecte');
      console.error('  2. Cluster en pause ou supprimé');
      console.error('  3. Liste blanche IP restrictive');
      console.error('\n💡 Solutions:');
      console.error('  - Vérifiez l\'état du cluster dans MongoDB Atlas');
      console.error('  - Configurez l\'accès réseau (Network Access) pour autoriser votre IP');
      
    } else {
      console.error('\n⚠️  Erreur inconnue:', error.message);
    }
    
    console.error('\n📋 Détails techniques:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    
    console.error('\n═'.repeat(60));
    process.exit(1);
  }
}

// Exécuter le test
testConnection();
