# Migration de JSON vers MongoDB

Ce guide vous aide à migrer votre portfolio de stockage JSON vers MongoDB pour permettre la persistance des données en production (notamment sur Vercel).

## Pourquoi migrer vers MongoDB ?

Les plateformes serverless comme Vercel ont des systèmes de fichiers en **lecture seule**. Cela signifie que :
- ❌ Les modifications via l'interface admin ne peuvent pas être sauvegardées en production
- ❌ Les fichiers JSON ne peuvent pas être modifiés dynamiquement
- ✅ MongoDB résout ce problème en offrant une base de données persistante

## Prérequis

1. **Créer un compte MongoDB Atlas** (gratuit)
   - Visitez [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créez un compte gratuit
   - Créez un nouveau cluster (le tier gratuit M0 est suffisant)

2. **Obtenir votre URI de connexion**
   - Dans MongoDB Atlas, cliquez sur "Connect" pour votre cluster
   - Choisissez "Connect your application"
   - Copiez l'URI de connexion (format : `mongodb+srv://...`)
   - Remplacez `<password>` par votre mot de passe

## Étapes de migration

### 1. Configurer les variables d'environnement

#### En local (développement)

Créez ou modifiez le fichier `.env.local` :

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
```

#### Sur Vercel (production)

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez `MONGODB_URI` avec votre URI de connexion
4. Assurez-vous de l'ajouter pour tous les environnements (Production, Preview, Development)

### 2. Migrer les données existantes

Si vous avez déjà des données dans les fichiers JSON, utilisez le script de migration :

```bash
node scripts/migrate-to-mongodb.js
```

Ce script va :
- ✅ Lire vos fichiers JSON existants
- ✅ Se connecter à MongoDB
- ✅ Migrer toutes les données (about, contact, photos, videos)
- ✅ Confirmer que tout s'est bien passé

### 3. Tester localement

Démarrez votre serveur de développement :

```bash
npm run dev
```

Testez l'interface admin :
1. Connectez-vous à `/admin/login`
2. Modifiez quelques données
3. Vérifiez que les modifications sont sauvegardées
4. Rechargez la page pour confirmer la persistance

### 4. Déployer sur Vercel

```bash
git add .
git commit -m "Migration vers MongoDB"
git push
```

Vercel déploiera automatiquement votre application avec MongoDB configuré.

## Structure de la base de données

### Collections MongoDB

| Collection | Type | Description |
|------------|------|-------------|
| `about` | Document unique | Informations "À propos" (profil, compétences, etc.) |
| `contact` | Document unique | Informations de contact et réseaux sociaux |
| `photos` | Collection | Liste de toutes les photos du portfolio |
| `videos` | Collection | Liste de toutes les vidéos du portfolio |

### Format des documents

#### About & Contact
```javascript
{
  docId: "about-data" | "contact-data",  // Identifiant unique du document
  ...data  // Vos données actuelles
}
```

#### Photos & Videos
```javascript
{
  id: "photo-001-1234567890",  // ID généré automatiquement
  title: "...",
  description: "...",
  // ... autres champs
}
```

## Sécurité

### Bonnes pratiques

1. **Ne jamais commiter les secrets**
   - ❌ Ne commitez JAMAIS `.env.local`
   - ✅ Utilisez `.env.example` comme template
   - ✅ Ajoutez `.env.local` au `.gitignore`

2. **Restreindre l'accès MongoDB**
   - Dans MongoDB Atlas, configurez les "Network Access"
   - Ajoutez l'adresse IP `0.0.0.0/0` pour permettre Vercel (production)
   - Pour plus de sécurité, vous pouvez utiliser MongoDB Atlas avec des règles IP plus strictes

3. **Utiliser des mots de passe forts**
   - Générez un mot de passe complexe pour votre utilisateur MongoDB
   - Utilisez un gestionnaire de mots de passe

## Dépannage

### Erreur : "MONGODB_URI is not defined"

**Problème :** La variable d'environnement n'est pas configurée.

**Solution :**
- Vérifiez que `.env.local` existe et contient `MONGODB_URI`
- Sur Vercel, vérifiez les Environment Variables dans les paramètres
- Redéployez après avoir ajouté la variable sur Vercel

### Erreur : "Connection failed"

**Problème :** Impossible de se connecter à MongoDB.

**Solutions possibles :**
1. Vérifiez que votre URI est correcte
2. Vérifiez que votre mot de passe ne contient pas de caractères spéciaux (ou qu'ils sont URL-encodés)
3. Dans MongoDB Atlas, vérifiez "Network Access" et autorisez `0.0.0.0/0`
4. Vérifiez que votre cluster est démarré (pas en pause)

### Les données ne se sauvegardent pas

**Problème :** Les modifications ne persistent pas.

**Solutions :**
1. Vérifiez que `MONGODB_URI` est bien configuré
2. Consultez les logs dans la console du navigateur
3. Consultez les logs Vercel pour plus de détails
4. Vérifiez que votre token d'authentification est valide

## Migration réussie ! 🎉

Une fois la migration terminée :
- ✅ Vos données sont stockées dans MongoDB
- ✅ L'interface admin fonctionne en production
- ✅ Les modifications sont persistantes
- ✅ Plus de problèmes de système de fichiers en lecture seule

## Support

Si vous rencontrez des problèmes :
1. Consultez les logs de l'application
2. Vérifiez la documentation MongoDB Atlas
3. Ouvrez une issue sur GitHub avec les détails de l'erreur
