# Migration Aurora PostgreSQL - Guide Complet

Ce document explique comment migrer le projet de MongoDB vers Amazon Aurora PostgreSQL (DSQL) et comment le déployer sur Vercel.

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration AWS](#configuration-aws)
4. [Configuration Vercel](#configuration-vercel)
5. [Initialisation de la Base de Données](#initialisation-de-la-base-de-données)
6. [Migration des Données](#migration-des-données)
7. [Déploiement](#déploiement)
8. [Vérification](#vérification)

## Vue d'ensemble

Le projet a été migré de MongoDB vers Amazon Aurora PostgreSQL (DSQL) pour bénéficier de :
- **Performances améliorées** : Aurora DSQL offre des performances optimales pour les workloads serverless
- **Authentification IAM** : Sécurité renforcée sans gestion de mots de passe
- **Intégration Vercel** : Utilisation d'OIDC pour une authentification transparente
- **Scalabilité automatique** : Aurora DSQL s'adapte automatiquement à la charge

### Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Vercel    │      │   AWS IAM Role   │      │  Aurora DSQL     │
│  (Frontend) │─────▶│   (OIDC Auth)    │─────▶│  (PostgreSQL)    │
└─────────────┘      └──────────────────┘      └──────────────────┘
```

## Prérequis

### Outils Requis
- Node.js 20+
- AWS CLI configuré
- Compte Vercel
- Compte AWS avec permissions appropriées

### Packages NPM Installés
```bash
@aws/aurora-dsql-node-postgres-connector
@vercel/oidc-aws-credentials-provider
@vercel/functions
pg
@types/pg
```

## Configuration AWS

### 1. Créer un Cluster Aurora DSQL

Si ce n'est pas déjà fait, créez un cluster Aurora DSQL :

```bash
aws dsql create-cluster \
  --region us-east-1
```

Notez l'endpoint du cluster qui ressemble à : `xxxxx.dsql.us-east-1.on.aws`

### 2. Configurer IAM pour Vercel OIDC

Créez un rôle IAM avec la policy de trust suivante :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::232235993921:oidc-provider/oidc.vercel.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.vercel.com:aud": "https://vercel.com"
        }
      }
    }
  ]
}
```

### 3. Attacher les Permissions Aurora

Attachez cette policy au rôle IAM :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dsql:DbConnect",
        "dsql:DbConnectAdmin"
      ],
      "Resource": "arn:aws:dsql:us-east-1:232235993921:cluster/antoe457zq2ovgrl4a4szhmcqq"
    }
  ]
}
```

## Configuration Vercel

### 1. Configurer les Variables d'Environnement

Dans votre projet Vercel, ajoutez les variables d'environnement suivantes :

**Variables AWS et Aurora :**
```
AWS_ACCOUNT_ID=232235993921
AWS_REGION=us-east-1
AWS_RESOURCE_ARN=arn:aws:dsql:us-east-1:232235993921:cluster/antoe457zq2ovgrl4a4szhmcqq
AWS_ROLE_ARN=arn:aws:iam::232235993921:role/Vercel/access-firstprodportfolio
```

**Variables PostgreSQL :**
```
PGDATABASE=postgres
PGHOST=antoe457zq2ovgrl4a4szhmcqq.dsql.us-east-1.on.aws
PGPORT=5432
PGSSLMODE=require
PGUSER=admin
```

**Autres Variables (conservées) :**
```
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Configurer OIDC dans Vercel

1. Accédez aux **Project Settings** dans Vercel
2. Allez dans **General** → **OIDC**
3. Activez l'intégration AWS
4. Entrez l'ARN du rôle IAM créé précédemment

## Initialisation de la Base de Données

### 1. Exécuter le Script d'Initialisation

Le fichier `scripts/init-aurora-schema.sql` contient le schéma PostgreSQL. Exécutez-le pour créer les tables :

```bash
# Via AWS CLI avec le Data API
aws dsql execute-statement \
  --cluster-arn arn:aws:dsql:us-east-1:232235993921:cluster/antoe457zq2ovgrl4a4szhmcqq \
  --database postgres \
  --statement "$(cat scripts/init-aurora-schema.sql)"
```

### 2. Structure des Tables

Le schéma crée les tables suivantes :

- **about** : Informations "À propos" (document unique)
- **contact** : Informations de contact (document unique)
- **settings** : Paramètres du site (document unique)
- **photos** : Collection de photos
- **videos** : Collection de vidéos
- **reviews** : Avis clients

Chaque table inclut :
- Timestamps automatiques (`created_at`, `updated_at`)
- Index pour optimiser les performances
- Contraintes de validation

## Migration des Données

### Option 1 : Migration Manuelle depuis MongoDB

Si vous avez des données existantes dans MongoDB :

```javascript
// Script de migration (à créer dans scripts/migrate-data.js)
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');

async function migrate() {
  // Connexion MongoDB
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const mongodb = mongoClient.db('portfolio');

  // Connexion PostgreSQL
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    ssl: true,
  });

  // Migrer les photos
  const photos = await mongodb.collection('photos').find({}).toArray();
  for (const photo of photos) {
    await pool.query(
      `INSERT INTO photos (id, title, description, year, image_url, thumbnail_url, category, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [photo.id, photo.title, photo.description, photo.year, photo.image_url, 
       photo.thumbnail_url, photo.category, photo.location]
    );
  }

  // Répéter pour les autres collections...

  await pool.end();
  await mongoClient.close();
}

migrate().catch(console.error);
```

### Option 2 : Démarrage à Zéro

Si vous démarrez avec une base vide :
1. Le site fonctionnera avec des données par défaut
2. Utilisez le panneau d'administration pour ajouter du contenu
3. Les données seront automatiquement sauvegardées dans Aurora

## Déploiement

### 1. Déploiement sur Vercel

```bash
# Depuis la racine du projet
vercel deploy --prod
```

Ou utilisez l'intégration Git :
1. Push vos modifications sur la branche principale
2. Vercel déploiera automatiquement

### 2. Vérification du Déploiement

Une fois déployé, vérifiez :

```bash
# Tester l'API publique
curl https://your-domain.vercel.app/api/public/about

# Tester la connexion à la base de données
# (via le panneau admin après authentification)
```

## Vérification

### 1. Test de Connexion

Créez un endpoint de test (temporaire) :

```typescript
// src/app/api/test-aurora/route.ts
import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/storage/aurora';

export async function GET() {
  try {
    const isConnected = await checkConnection();
    return NextResponse.json({ 
      status: 'ok', 
      connected: isConnected 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
```

### 2. Vérification des Logs

Dans Vercel :
1. Accédez aux **Function Logs**
2. Recherchez les messages `[Aurora]` pour confirmer la connexion
3. Vérifiez qu'il n'y a pas d'erreurs de connexion

### 3. Tests Fonctionnels

Testez chaque fonctionnalité :
- ✅ Lecture des données publiques
- ✅ Authentification admin
- ✅ Création de photos/vidéos
- ✅ Modification des paramètres
- ✅ Gestion des avis

## Dépannage

### Erreur "Missing environment variables"

**Symptôme :** Message d'erreur au démarrage
**Solution :** Vérifiez que toutes les variables d'environnement sont configurées dans Vercel

### Erreur de Connexion IAM

**Symptôme :** "Access denied" ou "Authentication failed"
**Solution :** 
1. Vérifiez que le rôle IAM a les bonnes permissions
2. Vérifiez la configuration OIDC dans Vercel
3. Assurez-vous que l'ARN du rôle est correct

### Erreur de Schéma

**Symptôme :** "Table does not exist" ou "Column not found"
**Solution :** Exécutez à nouveau le script d'initialisation du schéma

### Problèmes de Performance

**Symptôme :** Requêtes lentes
**Solution :** 
1. Vérifiez que les index sont créés (voir init-aurora-schema.sql)
2. Consultez les métriques Aurora dans la console AWS
3. Envisagez d'optimiser les requêtes

## Support

Pour plus d'informations :
- [Documentation Aurora DSQL](https://docs.aws.amazon.com/aurora-dsql/)
- [Documentation Vercel OIDC](https://vercel.com/docs/oidc)
- [Aurora DSQL Node.js Connector](https://github.com/awslabs/aurora-dsql-nodejs-connector)

## Prochaines Étapes

Après la migration réussie :
1. ✅ Désactiver MongoDB (si migration complète)
2. ✅ Supprimer les anciennes dépendances MongoDB
3. ✅ Mettre à jour la documentation
4. ✅ Former l'équipe sur le nouveau système
5. ✅ Surveiller les performances et les coûts
