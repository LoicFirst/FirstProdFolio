#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script de test de connexion MongoDB
 * Ce script vérifie que la connexion à MongoDB fonctionne correctement
 * 
 * MongoDB Connection Test Script
 * This script verifies that the MongoDB connection is working properly
 * 
 * Usage:
 *   node scripts/test-mongodb.js
 *   
 * Ou avec des variables d'environnement personnalisées:
 * Or with custom environment variables:
 *   MONGODB_URI="mongodb+srv://..." node scripts/test-mongodb.js
 */

// Charger les variables d'environnement depuis .env.local si présent
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('[TEST] Loading environment variables from .env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const mongoose = require('mongoose');

async function testConnection() {
  console.log('\n========================================');
  console.log('  Test de Connexion MongoDB');
  console.log('========================================\n');

  // Vérifier la présence de MONGODB_URI
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ ERREUR: MONGODB_URI n\'est pas définie');
    console.error('   Configurez cette variable dans .env.local ou dans les variables d\'environnement\n');
    process.exit(1);
  }

  console.log('✓ MONGODB_URI est définie');
  
  // Masquer le mot de passe pour l'affichage
  const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`  URI: ${maskedUri}\n`);

  // Valider le format de base
  console.log('Validation du format de l\'URI...');
  
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error('❌ ERREUR: L\'URI doit commencer par "mongodb://" ou "mongodb+srv://"\n');
    process.exit(1);
  }
  console.log('✓ Format de l\'URI correct\n');

  // Tenter la connexion
  console.log('Connexion à MongoDB...');
  console.log('(timeout: 10 secondes)\n');

  const startTime = Date.now();

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    const duration = Date.now() - startTime;
    
    console.log('✅ CONNEXION RÉUSSIE!');
    console.log(`   Temps de connexion: ${duration}ms`);
    console.log(`   État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'État inconnu'}`);
    console.log(`   Base de données: ${mongoose.connection.name || 'Par défaut'}`);
    console.log(`   Host: ${mongoose.connection.host || 'Inconnu'}`);
    
    // Tester une opération simple
    console.log('\nTest d\'une opération de lecture...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✓ Collections trouvées: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('  Collections:');
      collections.forEach(col => {
        console.log(`    - ${col.name}`);
      });
    }
    
    console.log('\n========================================');
    console.log('  ✅ TOUS LES TESTS SONT PASSÉS!');
    console.log('========================================\n');
    
    await mongoose.connection.close();
    console.log('Connexion fermée proprement.\n');
    
    process.exit(0);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`\n❌ ÉCHEC DE LA CONNEXION (après ${duration}ms)`);
    console.error('\nDétails de l\'erreur:');
    console.error(`   Type: ${error.name || 'Erreur inconnue'}`);
    console.error(`   Message: ${error.message || 'Pas de message'}`);
    
    // Diagnostic selon le type d'erreur
    console.error('\n📋 Diagnostic:');
    
    if (error.message.includes('authentication failed') || error.message.includes('auth failed')) {
      console.error('   → Erreur d\'authentification');
      console.error('   → Vérifiez le nom d\'utilisateur et le mot de passe dans MONGODB_URI');
      console.error('   → Assurez-vous que l\'utilisateur existe dans MongoDB Atlas (Database Access)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   → Erreur de résolution DNS / Host non trouvé');
      console.error('   → Vérifiez l\'adresse du cluster dans MONGODB_URI');
      console.error('   → Assurez-vous que le cluster est actif dans MongoDB Atlas');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      console.error('   → Timeout de connexion');
      console.error('   → Vérifiez la configuration Network Access dans MongoDB Atlas');
      console.error('   → Ajoutez 0.0.0.0/0 aux IP autorisées pour tester');
      console.error('   → Vérifiez votre connexion internet');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('   → Impossible de se connecter au serveur MongoDB');
      console.error('   → Vérifiez que le cluster est en ligne');
      console.error('   → Vérifiez la configuration Network Access (IP whitelist)');
    } else if (error.message.includes('Invalid connection string')) {
      console.error('   → Format de l\'URI de connexion invalide');
      console.error('   → Format attendu: mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0');
    }
    
    console.error('\n💡 Ressources:');
    console.error('   - Guide de configuration: MONGODB_SETUP.md');
    console.error('   - Documentation MongoDB Atlas: https://docs.atlas.mongodb.com/');
    console.error('   - Vérification de santé: GET /api/health\n');
    
    console.error('========================================\n');
    
    try {
      await mongoose.connection.close();
    } catch {
      // Ignorer les erreurs de fermeture
    }
    
    process.exit(1);
  }
}

// Exécuter le test
testConnection();
