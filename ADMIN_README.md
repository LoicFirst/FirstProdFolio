# Administration du Portfolio - Guide d'utilisation

Ce document explique comment utiliser l'interface d'administration privée du portfolio de Loic Mazagran.

## 🔐 Accès à l'interface d'administration

### URL d'accès
L'interface d'administration est accessible à l'adresse suivante :
- **Production** : `https://first-prod-folio.vercel.app/admin`
- **Local** : `http://localhost:3000/admin`

### Connexion
Utilisez vos identifiants configurés lors du déploiement :
- **Email** : Défini dans la variable d'environnement `ADMIN_EMAIL`
- **Mot de passe** : Défini dans la variable d'environnement `ADMIN_PASSWORD`

## 📋 Fonctionnalités disponibles

### 1. Dashboard
Vue d'ensemble de votre portfolio avec :
- Statistiques rapides (nombre de vidéos, photos)
- Accès rapide à toutes les sections
- Guide d'utilisation intégré

### 2. Gestion des Vidéos
- **Ajouter** une nouvelle vidéo avec titre, description, URL YouTube/Vimeo, miniature, durée et catégorie
- **Modifier** les informations d'une vidéo existante
- **Supprimer** une vidéo
- **Publier/Dépublier** une vidéo (les vidéos non publiées n'apparaissent pas sur le site public)

### 3. Gestion des Photos
- **Ajouter** une nouvelle photo avec titre, description, image, catégorie et lieu
- **Télécharger** des images directement vers le cloud (Cloudinary)
- **Modifier** les informations d'une photo existante
- **Supprimer** une photo
- **Publier/Dépublier** une photo

### 4. Page À propos
- **Profil** : Modifier votre nom, titre, biographie, photo, années d'expérience et localisation
- **Compétences** : Ajouter/modifier/supprimer des catégories de compétences
- **Logiciels** : Gérer la liste des logiciels maîtrisés avec leur niveau de maîtrise
- **Récompenses** : Ajouter/modifier/supprimer vos distinctions et prix

### 5. Informations de Contact
- **Contact** : Modifier votre email, téléphone et localisation
- **Disponibilité** : Indiquer votre statut (disponible, occupé, non disponible)
- **Réseaux sociaux** : Ajouter/modifier/supprimer vos liens vers Instagram, YouTube, Vimeo, LinkedIn, Twitter

## 🔄 Synchronisation avec le site public

Les modifications effectuées dans l'interface d'administration sont **automatiquement synchronisées** avec le site public :
- Les changements sont enregistrés en base de données
- Le site public récupère les données depuis la base de données
- Aucune action manuelle n'est nécessaire

## ⚙️ Configuration technique

### Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Base de données MongoDB
MONGODB_URI=mongodb+srv://steveduchan2007_db_user:fhXJuCrVc95T8Xh@cluster0.tvtrbmv.mongodb.net/portfolio?retryWrites=true&w=majority

# NextAuth.js (authentification)
NEXTAUTH_URL=https://first-prod-folio.vercel.app
NEXTAUTH_SECRET=v9j9sPqkmnJoQymkPVBWicfALfI5p/5Eu/Uk0eGAqpU=

# Identifiants admin
ADMIN_EMAIL=loicmazagran2007@gmail.com
ADMIN_PASSWORD=jf5z243LuwKvt
ADMIN_NAME=Loic Mazagran

# Cloudinary (upload d'images)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### Synchronisation automatique des identifiants

L'application synchronise automatiquement les identifiants admin avec les variables d'environnement :
- Lors de la première connexion, si aucun compte admin n'existe, il sera créé automatiquement
- Si les identifiants dans les variables d'environnement changent, ils seront mis à jour automatiquement lors de la prochaine connexion
- Plus besoin d'appeler manuellement l'API de seed pour créer le compte admin

### Initialisation de la base de données

Lors du premier déploiement, vous pouvez initialiser la base de données avec les données existantes en utilisant l'API de seed :

```bash
curl -X POST https://votre-domaine/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "votre-nextauth-secret"}'
```

Cela créera :
- Un utilisateur admin avec les identifiants configurés
- Les vidéos, photos et informations existantes depuis les fichiers JSON

### Mise à jour des identifiants admin

Si vous avez besoin de mettre à jour les identifiants admin après le déploiement initial :

1. **Mettre à jour les variables d'environnement** sur Vercel :
   - `ADMIN_EMAIL` : Votre nouvel email admin
   - `ADMIN_PASSWORD` : Votre nouveau mot de passe admin

2. **Forcer la mise à jour** en appelant l'API de seed avec l'option `forceUpdate` :
   ```bash
   curl -X POST https://votre-domaine/api/admin/seed \
     -H "Content-Type: application/json" \
     -d '{"secret": "votre-nextauth-secret", "forceUpdate": true}'
   ```

### Résolution de l'erreur "Configuration"

Si vous voyez l'erreur `?error=Configuration` sur la page de connexion, vérifiez que :
1. La variable `NEXTAUTH_SECRET` est correctement définie sur Vercel
2. La variable `NEXTAUTH_URL` correspond à votre URL de production (ex: `https://first-prod-folio.vercel.app`)
3. La variable `MONGODB_URI` est correctement configurée et accessible

## 🛡️ Sécurité

### Bonnes pratiques
1. **Mot de passe fort** : Utilisez un mot de passe d'au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux
2. **Secret unique** : Générez un secret NextAuth unique avec `openssl rand -base64 32`
3. **Variables d'environnement** : Ne commitez jamais vos variables d'environnement dans le code
4. **Déconnexion** : Déconnectez-vous toujours après utilisation

### Fonctionnalités de sécurité intégrées
- Hachage des mots de passe avec bcrypt (12 rounds)
- Sessions JWT avec expiration automatique (24h)
- Protection CSRF intégrée à NextAuth.js
- Validation des données côté serveur
- Routes API protégées par authentification

## 📞 Support

En cas de problème ou question, consultez la documentation technique ou contactez le développeur.

---

**Version** : 1.0.0
**Dernière mise à jour** : Janvier 2026
