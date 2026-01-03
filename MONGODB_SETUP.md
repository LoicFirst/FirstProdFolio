# Guide de Configuration MongoDB

Ce guide vous aidera à configurer correctement la connexion MongoDB pour votre portfolio.

## 📋 Prérequis

- Un compte MongoDB Atlas (gratuit) : https://www.mongodb.com/cloud/atlas/register
- Node.js installé sur votre machine
- Accès au panneau d'administration de votre déploiement (Vercel, etc.)

## 🚀 Étapes de Configuration

### 1. Créer un Cluster MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Cliquez sur "Build a Database" (ou "Create" si vous avez déjà des clusters)
3. Choisissez l'option **FREE** (M0 Sandbox)
4. Sélectionnez votre région préférée (choisissez la plus proche de vos utilisateurs)
5. Cliquez sur "Create Cluster"
6. Attendez quelques minutes que le cluster soit créé

### 2. Configurer l'Accès Réseau

1. Dans le menu latéral, cliquez sur **Network Access**
2. Cliquez sur **Add IP Address**
3. Pour le développement, cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Pour la production, utilisez les IPs spécifiques de Vercel
4. Cliquez sur **Confirm**
5. Attendez 2-3 minutes que la configuration soit active

### 3. Créer un Utilisateur de Base de Données

1. Dans le menu latéral, cliquez sur **Database Access**
2. Cliquez sur **Add New Database User**
3. Choisissez **Password** comme méthode d'authentification
4. Créez un nom d'utilisateur (exemple: `portfolio_user`)
5. Créez un mot de passe sécurisé
   - ✅ Utilisez un générateur de mot de passe
   - ✅ Évitez les caractères spéciaux complexes (` @ : / ? # [ ] @`)
   - ❌ N'utilisez PAS `password`, `123456`, ou des placeholders
6. Pour les privilèges, sélectionnez **Read and write to any database**
7. Cliquez sur **Add User**

### 4. Obtenir la Chaîne de Connexion

1. Retournez à **Database** dans le menu latéral
2. Cliquez sur **Connect** sur votre cluster
3. Choisissez **Drivers**
4. Sélectionnez **Node.js** comme driver
5. Copiez la chaîne de connexion qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```

### 5. Configurer les Variables d'Environnement

#### Pour le Développement Local

1. À la racine de votre projet, créez un fichier `.env.local`
2. Ajoutez votre URI MongoDB :
   ```env
   MONGODB_URI=mongodb+srv://portfolio_user:VotreMotDePasse123@cluster0.abc123.mongodb.net/?appName=Cluster0
   ```
3. Remplacez :
   - `portfolio_user` par votre nom d'utilisateur
   - `VotreMotDePasse123` par votre mot de passe
   - `cluster0.abc123` par l'adresse de votre cluster

#### Pour Vercel (Production)

1. Allez dans votre projet Vercel
2. Cliquez sur **Settings** > **Environment Variables**
3. Ajoutez une nouvelle variable :
   - **Name**: `MONGODB_URI`
   - **Value**: Votre chaîne de connexion complète
   - **Environments**: Cochez Production, Preview, et Development
4. Cliquez sur **Save**
5. Redéployez votre application

## ✅ Vérification de la Configuration

### Méthode 1 : Script de Test (Recommandé)

Utilisez le script de diagnostic fourni :

```bash
npm run test:mongodb
```

Ce script va :
- ✓ Vérifier que `.env.local` existe
- ✓ Valider le format de `MONGODB_URI`
- ✓ Tester la connexion au serveur
- ✓ Lister les collections disponibles
- ✓ Fournir des messages d'erreur détaillés en cas de problème

### Méthode 2 : Via l'Application

1. Démarrez votre application : `npm run dev`
2. Accédez à `/admin/login`
3. Essayez de vous connecter
4. Si la configuration est correcte, vous ne verrez pas d'erreur de configuration

## ❌ Erreurs Courantes et Solutions

### Erreur : "Format de connexion MongoDB invalide"

**Causes possibles :**
- L'URI ne commence pas par `mongodb+srv://`
- Le mot de passe contient toujours `<password>` ou un placeholder
- Les credentials sont manquants ou mal formatés

**Solutions :**
1. Vérifiez que votre URI commence par `mongodb+srv://`
2. Assurez-vous d'avoir remplacé `<password>` par votre vrai mot de passe
3. Vérifiez le format : `mongodb+srv://username:password@host/?appName=Name`
4. Utilisez le script de test : `npm run test:mongodb`

### Erreur : "Échec d'authentification MongoDB"

**Causes possibles :**
- Nom d'utilisateur incorrect
- Mot de passe incorrect
- Mot de passe contenant des caractères spéciaux non encodés

**Solutions :**
1. Vérifiez vos identifiants dans MongoDB Atlas (Database Access)
2. Essayez de recréer l'utilisateur avec un mot de passe plus simple
3. Si votre mot de passe contient `@`, remplacez-le par `%40`
4. Si votre mot de passe contient `:`, remplacez-le par `%3A`

### Erreur : "Serveur MongoDB introuvable"

**Causes possibles :**
- Adresse du cluster incorrecte
- Le cluster a été supprimé
- Problème DNS

**Solutions :**
1. Retournez dans MongoDB Atlas
2. Allez dans Database > Connect > Drivers
3. Copiez à nouveau la chaîne de connexion
4. Assurez-vous que le cluster est actif (pas en pause)

### Erreur : "Délai de connexion expiré"

**Causes possibles :**
- Liste blanche IP mal configurée
- Le cluster est en pause
- Problème de pare-feu local

**Solutions :**
1. Dans MongoDB Atlas, allez dans Network Access
2. Ajoutez `0.0.0.0/0` pour autoriser toutes les IPs (développement)
3. Attendez 2-3 minutes après la modification
4. Vérifiez que le cluster n'est pas en pause dans la vue Database
5. Si vous utilisez un VPN, essayez de le désactiver

### Erreur : "Impossible de joindre le serveur MongoDB"

**Causes possibles :**
- Cluster gratuit mis en pause après 60 jours d'inactivité
- Cluster supprimé
- Configuration réseau restrictive

**Solutions :**
1. Vérifiez l'état du cluster dans MongoDB Atlas
2. Si le cluster est en pause, cliquez pour le réactiver
3. Si le cluster est supprimé, créez-en un nouveau
4. Vérifiez la configuration Network Access

## 📚 Ressources Utiles

- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Format de connexion MongoDB](https://docs.mongodb.com/manual/reference/connection-string/)
- [Encodage des caractères spéciaux](https://www.urlencoder.org/)
- [Troubleshooting MongoDB Atlas](https://docs.atlas.mongodb.com/troubleshoot-connection/)

## 🔒 Bonnes Pratiques de Sécurité

1. **Ne commitez jamais votre `.env.local`** dans Git
2. **Utilisez des mots de passe forts** (au moins 16 caractères)
3. **Limitez l'accès IP en production** aux seules IPs nécessaires
4. **Créez des utilisateurs dédiés** avec les permissions minimales nécessaires
5. **Changez régulièrement** vos mots de passe MongoDB
6. **Activez l'audit** dans MongoDB Atlas pour surveiller les accès

## 💡 Conseils pour Vercel

### Configuration des Variables d'Environnement

1. Les variables doivent être configurées dans Vercel Settings
2. Assurez-vous de sélectionner tous les environnements (Production, Preview, Development)
3. Après modification, redéployez votre application
4. Les variables ne sont PAS visibles dans les logs publics

### IPs de Vercel pour MongoDB Atlas

Pour une sécurité maximale en production, ajoutez les IPs de Vercel à votre liste blanche MongoDB Atlas.

Référence : [Vercel IP Addresses](https://vercel.com/docs/concepts/edge-network/ip-addresses)

## 🆘 Support

Si vous rencontrez toujours des problèmes après avoir suivi ce guide :

1. Exécutez le script de diagnostic : `npm run test:mongodb`
2. Consultez les logs de votre application
3. Vérifiez la documentation dans `scripts/README.md`
4. Ouvrez une issue sur GitHub avec les détails de l'erreur

---

**Note :** Ce guide est maintenu à jour avec les dernières versions de MongoDB Atlas et Next.js.
