# Scripts Utilitaires

Ce dossier contient des scripts utilitaires pour aider à la maintenance et au diagnostic de l'application.

## test-mongodb-connection.js

Script de test de connexion MongoDB avec diagnostic détaillé.

### Description

Ce script vous aide à :
- Valider le format de votre `MONGODB_URI`
- Tester la connexion à votre cluster MongoDB Atlas
- Diagnostiquer les problèmes de connexion courants
- Obtenir des messages d'erreur clairs et actionnables

### Utilisation

```bash
# Depuis la racine du projet
node scripts/test-mongodb-connection.js
```

### Prérequis

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez votre `MONGODB_URI` dans ce fichier :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName
```

### Étapes du diagnostic

Le script effectue les vérifications suivantes :

1. ✅ **Chargement des variables d'environnement** - Vérifie que `.env.local` existe
2. ✅ **Vérification de MONGODB_URI** - Confirme que la variable est définie
3. ✅ **Validation du format** - Valide la syntaxe de l'URI
4. ✅ **Test de connexion** - Tente de se connecter au serveur MongoDB
5. ✅ **Test d'opération** - Liste les collections disponibles

### Messages d'erreur courants

#### 🔐 Problème d'authentification

```
❌ Échec de connexion
🔐 Problème d'authentification
```

**Solutions :**
- Vérifiez vos identifiants dans MongoDB Atlas (Database Access)
- Assurez-vous que le mot de passe est correct (pas de caractères spéciaux non encodés)
- Vérifiez que l'utilisateur a les permissions sur la base de données

#### 🌐 Serveur MongoDB introuvable

```
❌ Échec de connexion
🌐 Serveur MongoDB introuvable
```

**Solutions :**
- Vérifiez l'adresse du cluster dans MongoDB Atlas (Database > Connect)
- Copiez la chaîne de connexion exacte depuis Atlas
- Assurez-vous que le cluster existe et n'a pas été supprimé

#### ⏱️ Délai de connexion expiré

```
❌ Échec de connexion
⏱️ Délai de connexion expiré
```

**Solutions :**
- Ajoutez `0.0.0.0/0` à la liste blanche dans MongoDB Atlas (Network Access)
- Vérifiez que le cluster est actif (pas en pause)
- Attendez 2-3 minutes après modification de la liste blanche IP

### Exemple de sortie réussie

```
🔍 Test de connexion MongoDB

════════════════════════════════════════════════════════════

📂 Étape 1: Chargement des variables d'environnement
✅ Fichier .env.local chargé

🔑 Étape 2: Vérification de MONGODB_URI
✅ MONGODB_URI trouvé: mongodb+srv://***:***@cluster0.xxxxx.mongodb.net/?appName=Cluster0

✓ Étape 3: Validation du format
✅ Format valide

🔌 Étape 4: Test de connexion au serveur MongoDB
⏳ Connexion en cours...
✅ Connexion réussie!
⏱️  Temps de connexion: 1234ms
📊 Informations de connexion:
   - Nom de la base: portfolio
   - État: Connecté
   - Hôte: cluster0-shard-00-00.xxxxx.mongodb.net

📝 Étape 5: Test d'opération de base
✅ Collections trouvées: 5
   Collections:
   - users
   - videos
   - photos
   - about
   - contact

✅ Déconnexion réussie

════════════════════════════════════════════════════════════
🎉 Tous les tests sont passés avec succès!
✅ Votre configuration MongoDB est correcte
════════════════════════════════════════════════════════════
```

## Support

Si vous rencontrez des problèmes avec ces scripts, consultez :
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guide de dépannage de connexion](https://docs.mongodb.com/manual/reference/connection-string/)
- Le fichier `ADMIN_README.md` à la racine du projet
