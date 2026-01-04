# Administration du Portfolio - Guide d'utilisation

Ce document explique comment utiliser l'interface d'administration privée du portfolio de Loic Mazagran.

## 🔐 Accès à l'interface d'administration

### URL d'accès
L'interface d'administration est accessible à l'adresse suivante :
- **Production** : `https://first-prod-folio.vercel.app/admin`
- **Local** : `http://localhost:3000/admin`

### Connexion
L'application utilise maintenant une authentification JWT simplifiée avec des identifiants stockés de manière sécurisée dans `data.json` :
- **Email** : `loicmazagran2007@gmail.com`
- **Mot de passe** : `CRyTDXCGhADE4`

Le mot de passe est hashé avec bcrypt pour la sécurité.

## 📋 Fonctionnalités disponibles

### 1. Dashboard
Vue d'ensemble de votre portfolio avec :
- Statistiques rapides (nombre de vidéos, photos)
- Accès rapide à toutes les sections
- Guide d'utilisation intégré

### 2. Gestion des Vidéos
- **Ajouter** une nouvelle vidéo avec titre, description, URL YouTube, miniature, durée et catégorie
- **Modifier** les informations d'une vidéo existante
- **Supprimer** une vidéo
- **Publier/Dépublier** une vidéo (les vidéos non publiées n'apparaissent pas sur le site public)

### 3. Gestion des Photos
- **Ajouter** une nouvelle photo avec titre, description, image, catégorie et lieu
- **Télécharger** des images directement (stockées localement dans `/public/static/images` ou via Cloudinary)
- **Modifier** les informations d'une photo existante
- **Supprimer** une photo
- **Publier/Dépublier** une photo

### 4. Gestion des Projets (Nouvelle fonctionnalité)
- **Ajouter** un nouveau projet avec titre, description, vidéo YouTube, images et URL externe
- **Modifier** les informations d'un projet existant
- **Supprimer** un projet
- Les projets sont accessibles publiquement via `/api/public/projects`

### 5. Page À propos
- **Profil** : Modifier votre nom, titre, biographie, photo, années d'expérience et localisation
- **Compétences** : Ajouter/modifier/supprimer des catégories de compétences
- **Logiciels** : Gérer la liste des logiciels maîtrisés avec leur niveau de maîtrise
- **Récompenses** : Ajouter/modifier/supprimer vos distinctions et prix

### 6. Informations de Contact
- **Contact** : Modifier votre email, téléphone et localisation
- **Disponibilité** : Indiquer votre statut (disponible, occupé, non disponible)
- **Réseaux sociaux** : Ajouter/modifier/supprimer vos liens vers Instagram, YouTube, Vimeo, LinkedIn, Twitter

## 🔄 Synchronisation avec le site public

Les modifications effectuées dans l'interface d'administration sont **automatiquement synchronisées** avec le site public :
- Les changements sont enregistrés dans des fichiers JSON locaux
- Le site public récupère les données depuis ces fichiers JSON
- Aucune action manuelle n'est nécessaire

## ⚙️ Configuration technique

### Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
# JWT Secret pour l'authentification (générer avec: openssl rand -base64 32)
JWT_SECRET=YOUR_GENERATED_SECRET_HERE

# Cloudinary (upload d'images) - Optionnel
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### Architecture de stockage des données

L'application utilise maintenant un système de fichiers JSON pour stocker toutes les données :

1. **`data.json`** : Contient les projets et les identifiants administrateur
2. **`src/data/videos.json`** : Contient les vidéos du portfolio
3. **`src/data/photos.json`** : Contient les photos du portfolio
4. **`src/data/about.json`** : Contient les informations de la page "À propos"
5. **`src/data/contact.json`** : Contient les informations de contact

Tous les fichiers sont automatiquement mis à jour lors des modifications via l'interface admin.

### Mise à jour des identifiants admin

Pour modifier le mot de passe administrateur :

1. Générer un nouveau hash bcrypt du mot de passe souhaité :
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VotreNouveauMotDePasse', 10, (err, hash) => { console.log(hash); });"
   ```

2. Mettre à jour le fichier `data.json` avec le nouveau hash :
   ```json
   {
     "admin": {
       "email": "loicmazagran2007@gmail.com",
       "password": "NOUVEAU_HASH_ICI"
     }
   }
   ```

### Résolution des problèmes de connexion

#### Erreur "Email ou mot de passe incorrect"

Si vous ne pouvez pas vous connecter :
1. **Vérifier les identifiants** : Email `loicmazagran2007@gmail.com` et mot de passe `CRyTDXCGhADE4`
2. **Consulter les logs** : Vérifiez les logs de déploiement sur Vercel pour voir les messages d'authentification :
   - `[AUTH]` : Messages d'authentification
   - `[JWT]` : Génération et vérification des tokens
   - `[API]` : Opérations API

#### Erreur "JWT_SECRET is not configured"

Si vous voyez cette erreur :
1. **Vérifier JWT_SECRET** : Assurez-vous que la variable d'environnement `JWT_SECRET` est définie
2. **Générer un nouveau secret** : Utilisez `openssl rand -base64 32` pour générer un secret sécurisé
3. **Redémarrer l'application** : Après avoir ajouté la variable d'environnement

#### Debugging avancé

Le système génère maintenant des logs détaillés avec les préfixes suivants :
- **`[AUTH]`** : Étapes d'authentification et validation des utilisateurs
- **`[DB]`** : Connexion et opérations de base de données
- **`[API]`** : Requêtes API et opérations CRUD
- **`[LOGIN]`** : Actions sur la page de connexion
- **`[SEED]`** : Initialisation de la base de données

Pour consulter ces logs sur Vercel :
1. Allez dans votre projet Vercel
2. Cliquez sur "Logs" dans le menu de gauche
3. Filtrez par "Runtime Logs" pour voir les logs en temps réel

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
- Logging détaillé pour le debugging et la surveillance
- Validation des variables d'environnement au démarrage
- Gestion robuste des erreurs de connexion

### Système de logging amélioré

Le système inclut maintenant un système de logging détaillé pour faciliter le diagnostic des problèmes :

**Préfixes de logs :**
- `[AUTH]` - Authentification et gestion des utilisateurs
- `[DB]` - Connexion et opérations MongoDB
- `[API]` - Requêtes et réponses API
- `[LOGIN]` - Actions sur la page de connexion
- `[SEED]` - Initialisation de la base de données

**Niveaux de logs :**
- ✓ Symbole pour les opérations réussies
- `CRITICAL:` pour les erreurs graves nécessitant une attention immédiate
- `ERROR:` pour les erreurs d'exécution
- Messages informatifs pour le suivi normal des opérations

## 📞 Support

En cas de problème ou question, consultez la documentation technique ou contactez le développeur.

---

**Version** : 2.0.0  
**Dernière mise à jour** : Janvier 2026

### Changelog

**v2.0.0 (Janvier 2026)**
- ✨ Système de logging détaillé pour faciliter le debugging
- 🔒 Validation des variables d'environnement au démarrage
- 🔍 **Validation robuste du format MONGODB_URI avec messages d'erreur détaillés**
- 🐛 Amélioration de la gestion des erreurs de connexion
- 📊 Timeouts configurés pour MongoDB (10s connexion, 45s opérations)
- 🔧 Messages d'erreur plus précis et informatifs (authentification, DNS, timeout, etc.)
- 🎯 **Catégorisation des erreurs MongoDB pour un diagnostic rapide**
- 📝 Documentation enrichie avec section de troubleshooting
- 🛡️ **Détection des mots de passe placeholder dans l'URI**

**v1.0.0**
- Lancement initial du panneau d'administration

## 🛡️ Sécurité (Mise à jour v3.0.0)

### Bonnes pratiques
1. **Mot de passe fort** : Le mot de passe par défaut doit être changé immédiatement après le déploiement
2. **Secret JWT unique** : Générez un secret JWT unique avec `openssl rand -base64 32`
3. **Ne pas commiter le .env** : Les fichiers .env.local sont automatiquement ignorés par git
4. **Déconnexion** : Déconnectez-vous toujours après utilisation

### Fonctionnalités de sécurité v3.0.0
- Hachage des mots de passe avec bcrypt (10 rounds)
- Tokens JWT avec expiration automatique (24h)
- Protection des routes API par JWT Bearer tokens
- Validation des données côté serveur
- Validation stricte des URLs YouTube
- Validation des types de fichiers pour les uploads
- File locking pour éviter les race conditions
- Vérification stricte des tokens JWT

---

### Changelog v3.0.0 (Janvier 2026)
- 🚀 **Migration complète de MongoDB vers JSON file storage**
- 🔐 **Remplacement de NextAuth par JWT authentication**
- 📁 Nouveau système de gestion de projets avec API REST complète
- 🖼️ Upload d'images local dans `/public/static/images`
- ⚡ Simplification de l'architecture (suppression MongoDB/Mongoose/NextAuth)
- 🔒 Amélioration de la sécurité JWT et validation stricte
- 🔄 Synchronisation en temps réel via fichiers JSON
- 🛡️ File locking pour éviter les conflits d'écriture
