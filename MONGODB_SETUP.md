# Guide de Configuration et de Dépannage MongoDB

Ce document fournit des instructions détaillées pour configurer et dépanner la connexion MongoDB dans l'application FirstProdFolio.

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Format de l'URI MongoDB](#format-de-luri-mongodb)
3. [Configuration dans Vercel](#configuration-dans-vercel)
4. [Vérification de la Connexion](#vérification-de-la-connexion)
5. [Dépannage des Erreurs Courantes](#dépannage-des-erreurs-courantes)
6. [Bonnes Pratiques de Sécurité](#bonnes-pratiques-de-sécurité)
7. [Tests de Connexion](#tests-de-connexion)

---

## Configuration Initiale

### 1. Créer un Cluster MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (le tier gratuit est suffisant pour commencer)
3. Attendez que le cluster soit provisionné (2-5 minutes)

### 2. Créer un Utilisateur de Base de Données

1. Dans MongoDB Atlas, allez dans **Database Access**
2. Cliquez sur **Add New Database User**
3. Choisissez **Password** comme méthode d'authentification
4. Créez un nom d'utilisateur et un mot de passe **sécurisé**
   - ⚠️ **IMPORTANT**: Ne pas utiliser de caractères spéciaux qui nécessitent un encodage URL (`@`, `/`, `:`, `%`, etc.)
   - Utilisez plutôt des lettres, chiffres, et tirets simples
5. Donnez les privilèges **Read and write to any database**
6. Cliquez sur **Add User**

### 3. Configurer l'Accès Réseau

1. Dans MongoDB Atlas, allez dans **Network Access**
2. Cliquez sur **Add IP Address**
3. Pour permettre l'accès depuis Vercel (ou tout environnement cloud):
   - Sélectionnez **Allow Access from Anywhere** (0.0.0.0/0)
   - Ou ajoutez les plages IP spécifiques de Vercel
4. Cliquez sur **Confirm**

### 4. Obtenir l'URI de Connexion

1. Dans MongoDB Atlas, allez dans **Database** puis cliquez sur **Connect**
2. Choisissez **Connect your application**
3. Sélectionnez **Node.js** comme driver
4. Copiez la chaîne de connexion fournie

---

## Format de l'URI MongoDB

### Format Correct (MongoDB Atlas - Décembre 2024+)

```
mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName
```

### Exemple Réel

```
mongodb+srv://myuser:SecurePass123@cluster0.abc123.mongodb.net/?appName=Cluster0
```

### ⚠️ Erreurs Courantes à Éviter

❌ **INCORRECT** - Placeholder non remplacé:
```
mongodb+srv://username:<password>@cluster.mongodb.net/
```

❌ **INCORRECT** - Format ancien avec nom de base de données:
```
mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority
```

❌ **INCORRECT** - Caractères spéciaux non-encodés dans le mot de passe:
```
mongodb+srv://user:p@ssw0rd!@cluster.mongodb.net/
```

✅ **CORRECT** - Format moderne simplifié:
```
mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

### Règles Importantes

1. **Ne pas** inclure de chevrons `< >` autour du mot de passe
2. **Remplacer** `<password>` par votre mot de passe réel
3. **Remplacer** `username` par votre nom d'utilisateur MongoDB
4. **Remplacer** `cluster.mongodb.net` par votre adresse de cluster réelle
5. Le paramètre `?appName=` est **optionnel** mais recommandé
6. **Ne pas** inclure de nom de base de données dans l'URI (l'application le gère)

---

## Configuration dans Vercel

### Variables d'Environnement Requises

Configurez ces variables dans les **Settings** > **Environment Variables** de votre projet Vercel:

```env
# Base de données MongoDB
MONGODB_URI=mongodb+srv://votre_user:votre_password@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# NextAuth.js (authentification)
NEXTAUTH_SECRET=votre_secret_genere_avec_openssl
NEXTAUTH_URL=https://votre-domaine.vercel.app

# Identifiants admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123
ADMIN_NAME=Nom Admin

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Vérification Post-Configuration

1. Après avoir configuré les variables, **redéployez** votre application
2. Les changements de variables d'environnement ne sont pas appliqués aux déploiements existants
3. Allez dans **Deployments** et cliquez sur **Redeploy** pour le dernier déploiement

---

## Vérification de la Connexion

### Point de Terminaison de Health Check

L'application inclut un endpoint de vérification de santé pour tester la connexion MongoDB:

```
GET /api/health
```

**Réponse en cas de succès (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T22:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "database": {
    "status": "connected",
    "connected": true,
    "responseTime": 145
  },
  "checks": {
    "mongoUri": true,
    "connection": true
  }
}
```

**Réponse en cas d'échec (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "database": {
    "status": "error: authentication failed",
    "connected": false
  },
  "checks": {
    "mongoUri": true,
    "connection": false
  }
}
```

### Utilisation via curl

```bash
curl https://votre-domaine.vercel.app/api/health
```

### Consultation des Logs Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **Logs** dans le menu de gauche
3. Filtrez par **Runtime Logs**
4. Recherchez les préfixes suivants:
   - `[DB]` - Logs de connexion à la base de données
   - `[AUTH]` - Logs d'authentification
   - `[API]` - Logs des requêtes API
   - `[HEALTH]` - Logs du health check

---

## Dépannage des Erreurs Courantes

### 1. Erreur d'Authentification

**Symptôme:**
```
[DB] Failed to connect to database: MongoServerError: Authentication failed
```

**Causes possibles:**
- Nom d'utilisateur ou mot de passe incorrect dans `MONGODB_URI`
- Utilisateur non créé dans MongoDB Atlas
- Utilisateur n'a pas les permissions nécessaires

**Solution:**
1. Vérifiez que l'utilisateur existe dans **Database Access** de MongoDB Atlas
2. Vérifiez que le mot de passe dans `MONGODB_URI` est correct
3. Assurez-vous que l'utilisateur a les privilèges **Read and write to any database**
4. Recréez l'utilisateur si nécessaire et mettez à jour `MONGODB_URI`

### 2. Erreur de Réseau / Timeout

**Symptôme:**
```
[DB] Failed to connect to database: MongoNetworkError: connection timed out
```

**Causes possibles:**
- IP non autorisée dans MongoDB Atlas
- Problème de connectivité réseau
- Firewall bloquant la connexion

**Solution:**
1. Dans MongoDB Atlas, allez dans **Network Access**
2. Ajoutez `0.0.0.0/0` pour autoriser toutes les IP (ou les IP de Vercel)
3. Attendez 1-2 minutes que les changements prennent effet
4. Redéployez votre application sur Vercel

### 3. Erreur de Format d'URI

**Symptôme:**
```
[DB] CRITICAL: MONGODB_URI validation failed: contains placeholder password
```

**Causes possibles:**
- Le placeholder `<password>` n'a pas été remplacé
- Format d'URI incorrect

**Solution:**
1. Vérifiez votre `MONGODB_URI` dans Vercel
2. Assurez-vous qu'il ne contient pas `<password>` ou `<username>`
3. Suivez le format correct: `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0`
4. Sauvegardez et redéployez

### 4. Erreur de Résolution DNS

**Symptôme:**
```
[DB] Failed to connect to database: getaddrinfo ENOTFOUND cluster.mongodb.net
```

**Causes possibles:**
- Adresse de cluster incorrecte dans l'URI
- Cluster MongoDB supprimé ou suspendu

**Solution:**
1. Vérifiez que votre cluster est actif dans MongoDB Atlas
2. Obtenez la chaîne de connexion correcte depuis **Database** > **Connect**
3. Mettez à jour `MONGODB_URI` avec la bonne adresse
4. Redéployez l'application

### 5. Validation de l'URI Échouée

**Symptôme:**
```
[DB] CRITICAL: MONGODB_URI validation failed: must start with "mongodb://" or "mongodb+srv://"
```

**Causes possibles:**
- URI mal formatée ou incomplète
- Espaces ou caractères invisibles dans l'URI

**Solution:**
1. Vérifiez que l'URI commence par `mongodb+srv://`
2. Supprimez les espaces avant et après l'URI
3. Copiez-collez l'URI directement depuis MongoDB Atlas
4. N'ajoutez pas de guillemets autour de l'URI dans Vercel

### 6. Erreur de Variables d'Environnement Manquantes

**Symptôme:**
```
[DB] CRITICAL: MONGODB_URI environment variable is not defined
```

**Causes possibles:**
- Variable non configurée dans Vercel
- Déploiement effectué avant la configuration des variables

**Solution:**
1. Allez dans **Settings** > **Environment Variables** dans Vercel
2. Ajoutez `MONGODB_URI` avec la bonne valeur
3. Sélectionnez les environnements appropriés (Production, Preview, Development)
4. **Redéployez** l'application (les nouvelles variables ne s'appliquent qu'aux nouveaux déploiements)

---

## Bonnes Pratiques de Sécurité

### 1. Gestion des Mots de Passe

- ✅ Utilisez des mots de passe longs (16+ caractères)
- ✅ Mélangez majuscules, minuscules, chiffres
- ✅ Évitez les caractères spéciaux qui nécessitent un encodage URL
- ❌ Ne commitez jamais les variables d'environnement dans Git
- ❌ Ne partagez jamais vos identifiants publiquement

### 2. Accès Réseau

- Pour **production**: Limitez l'accès aux IP de Vercel si possible
- Pour **développement**: Vous pouvez autoriser votre IP locale
- Évitez `0.0.0.0/0` si vous avez des besoins de sécurité élevés

### 3. Privilèges Utilisateur

- Créez un utilisateur spécifique pour l'application
- N'utilisez pas le compte admin MongoDB Atlas
- Donnez uniquement les privilèges nécessaires (Read and Write)

### 4. Rotation des Credentials

- Changez régulièrement les mots de passe
- Utilisez MongoDB Atlas pour mettre à jour les credentials
- Mettez à jour `MONGODB_URI` après chaque changement

### 5. Surveillance

- Consultez régulièrement les logs Vercel
- Surveillez les tentatives de connexion dans MongoDB Atlas
- Configurez des alertes pour les échecs de connexion

---

## Tests de Connexion

### Test Local

Créez un fichier `.env.local` à la racine du projet:

```env
MONGODB_URI=mongodb+srv://...votre_uri...
NEXTAUTH_SECRET=...votre_secret...
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=votrepassword
ADMIN_NAME=Admin
```

Lancez l'application en local:

```bash
npm install
npm run dev
```

Testez la connexion:

```bash
curl http://localhost:3000/api/health
```

### Test en Production

Après déploiement sur Vercel:

```bash
curl https://votre-domaine.vercel.app/api/health
```

Si le health check retourne `"status": "healthy"`, votre connexion MongoDB fonctionne correctement !

---

## Support et Ressources

### Documentation Officielle

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Logs et Debugging

Pour un debugging détaillé, consultez les logs Vercel avec les préfixes:
- `[DB]` - Opérations de base de données
- `[AUTH]` - Authentification
- `[API]` - Requêtes API
- `[HEALTH]` - Vérifications de santé

### Contact

En cas de problème persistant, contactez le support technique avec:
1. Les logs complets de Vercel
2. Le résultat de `/api/health`
3. La configuration (sans mots de passe) de vos variables d'environnement

---

**Version:** 1.0  
**Dernière mise à jour:** Janvier 2026  
**Auteur:** FirstProdFolio Development Team
