# FirstProdFolio

Portfolio personnel de Loic Mazagran - Réalisateur, monteur et créateur de contenus visuels.

## 🎬 Présentation

Ce site web présente mon portfolio de créations artistiques, notamment mes courts-métrages, vidéos et photographies. Le site est conçu pour être moderne, interactif et facile à administrer.

## 🚀 Technologies utilisées

### Frontend
- **Next.js** - Framework React pour le rendu côté serveur
- **TypeScript** - Typage statique pour JavaScript
- **Tailwind CSS** - Stylisation rapide et responsive
- **Framer Motion** - Animations fluides
- **React Player** - Lecteur vidéo moderne
- **React Icons** - Icônes SVG élégantes

### Backend & Base de Données
- **Amazon Aurora PostgreSQL (DSQL)** - Base de données serverless avec authentification IAM
- **Vercel OIDC** - Authentification sécurisée AWS sans credentials statiques
- **Node.js pg** - Driver PostgreSQL pour Node.js

### Fonctionnalités
- ✅ Page d'accueil avec animations
- ✅ Galerie vidéos avec effet Ambilight
- ✅ Galerie photos avec grille Masonry et Lightbox
- ✅ Page À propos avec compétences et parcours
- ✅ Formulaire de contact avec validation
- ✅ Bouton de contact flottant
- ✅ Navigation responsive
- ✅ SEO optimisé avec meta tags dynamiques
- ✅ Thème personnalisable via fichiers JSON

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── videos/            # Galerie vidéos
│   ├── photos/            # Galerie photos
│   ├── about/             # Page À propos
│   └── contact/           # Page Contact
├── components/            # Composants React
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── VideoCard.tsx
│   ├── PhotoGallery.tsx
│   ├── ContactForm.tsx
│   └── FloatingContact.tsx
├── data/                  # Fichiers de configuration JSON
│   ├── theme.json         # Configuration du thème
│   ├── videos.json        # Données des vidéos
│   ├── photos.json        # Données des photos
│   ├── about.json         # Données du profil
│   └── contact.json       # Informations de contact
├── lib/                   # Utilitaires
└── types/                 # Types TypeScript
```

## 🛠️ Installation et Configuration Automatique

Le projet inclut un script de configuration automatique qui s'exécute lors de l'installation.

### Installation Simple (3 étapes)

```bash
# 1. Cloner le repository
git clone https://github.com/LoicFirst/FirstProdFolio.git
cd FirstProdFolio

# 2. Installer les dépendances (la configuration se fait automatiquement)
npm install

# 3. Démarrer le serveur
npm run dev
```

Le script de configuration automatique (`postinstall`) va :
- ✅ Créer `data.json` depuis `data.json.example` (si nécessaire)
- ✅ Générer et configurer `JWT_SECRET` dans `.env.local` (si nécessaire)
- ✅ Valider la structure des fichiers de configuration

Le site sera accessible à [http://localhost:3000](http://localhost:3000).

### Configuration Manuelle (optionnelle)

Si vous souhaitez reconfigurer le projet :

```bash
npm run setup
```

## 🗄️ Configuration Aurora PostgreSQL

Le projet utilise Amazon Aurora PostgreSQL (DSQL) pour le stockage des données.

### Variables d'Environnement Requises

Copiez `.env.example` vers `.env.local` et configurez :

```bash
# AWS Configuration
AWS_ACCOUNT_ID=your-aws-account-id
AWS_REGION=us-east-1
AWS_RESOURCE_ARN=arn:aws:dsql:region:account:cluster/cluster-id
AWS_ROLE_ARN=arn:aws:iam::account:role/your-role

# PostgreSQL Configuration
PGDATABASE=postgres
PGHOST=your-cluster.dsql.region.on.aws
PGPORT=5432
PGSSLMODE=require
PGUSER=admin

# JWT Secret (généré automatiquement)
JWT_SECRET=your-jwt-secret

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Guide de Migration Complet

Pour un guide détaillé sur la configuration Aurora et le déploiement sur Vercel, consultez [AURORA_MIGRATION_GUIDE.md](./AURORA_MIGRATION_GUIDE.md).

Ce guide inclut :
- Configuration AWS IAM et Aurora DSQL
- Configuration Vercel OIDC
- Initialisation du schéma de base de données
- Migration des données depuis MongoDB
- Dépannage et résolution de problèmes

## 📊 Logs et Debugging

L'application utilise des logs détaillés avec des préfixes spécifiques pour faciliter le debugging.

### Préfixes de Logs

| Préfixe | Description | Exemple |
|---------|-------------|---------|
| `[AUTH]` | Authentification et login | `[AUTH] ✅ LOGIN SUCCESSFUL` |
| `[Aurora]` | Connexion Aurora PostgreSQL | `[Aurora] ✓ Connection pool created` |
| `[API]` | Requêtes API | `[API] GET /api/public/about` |
| `[ERROR]` | Erreurs critiques | `[ERROR] ❌ Connection failed` |
| `[SETUP]` | Configuration initiale | `[SETUP] ✅ Configuration terminée` |

### Exemples de Logs d'Authentification

**Connexion réussie :**
```
[AUTH] ========================================
[AUTH] Admin login attempt started
[AUTH] Credentials received
[AUTH] ✓ Successfully loaded admin data from JSON file
[AUTH] ✓ Email matches
[AUTH] ✓ Password verified successfully
[AUTH] ✅ LOGIN SUCCESSFUL
[AUTH] ========================================
```

**Erreur d'authentification :**
```
[AUTH] ⚠️  Authentication failed: Invalid password
```

### Exemples de Logs Base de Données

```
[JSON-DB] Reading data from: /path/to/data.json
[JSON-DB] ✓ File read successfully
[JSON-DB] ✓ JSON parsed successfully
[JSON-DB] Data structure check:
[JSON-DB]   - admin exists: true
[JSON-DB]   - projects count: 5
```

## 🔐 Authentification Admin

### Identifiants par Défaut

Les identifiants admin sont pré-configurés dans `data.json.example` :

- **Email :** `loicmazagran2007@gmail.com`
- **Mot de passe :** `CRyTDXCGhADE4`

### Connexion

1. Accédez à `/admin/login`
2. Entrez vos identifiants
3. Consultez les logs serveur pour le détail de l'authentification

### Modifier les Identifiants

Pour changer le mot de passe admin :

```bash
# Générer un nouveau hash bcrypt
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VOTRE_NOUVEAU_MOT_DE_PASSE', 10, (err, hash) => { console.log('Hash:', hash); });"

# Copier le hash dans data.json
```

## 📝 Configuration du contenu

### Modifier le thème

Éditez le fichier `src/data/theme.json` :

```json
{
  "theme": {
    "primary_color": "#3498db",
    "secondary_color": "#2ecc71",
    "font_family": "Roboto, sans-serif"
  }
}
```

### Ajouter une vidéo

Ajoutez une entrée dans `src/data/videos.json` :

```json
{
  "id": "video-123",
  "title": "Mon court-métrage",
  "description": "Ce court-métrage raconte...",
  "year": 2026,
  "video_url": "https://youtube.com/watch?v=...",
  "thumbnail_url": "/images/thumbnails/mon-film.jpg",
  "duration": "12:34",
  "category": "Court-métrage"
}
```

### Ajouter une photo

Ajoutez une entrée dans `src/data/photos.json` :

```json
{
  "id": "photo-123",
  "title": "Ma photo",
  "description": "Description de la photo",
  "year": 2026,
  "image_url": "/images/photos/ma-photo.jpg",
  "category": "Portrait",
  "location": "Paris, France"
}
```

## 🗄️ Base de données MongoDB Atlas

### Configuration de la connexion Atlas SQL

Le projet supporte MongoDB Atlas avec l'interface SQL. Pour configurer et tester votre connexion :

```bash
# Tester la connexion Atlas SQL
npm run test:atlas
```

📚 **Documentation complète** : Consultez [MONGODB_ATLAS_CONNECTION.md](MONGODB_ATLAS_CONNECTION.md) pour :
- Instructions détaillées de configuration
- Guide de dépannage des erreurs courantes
- Meilleures pratiques de sécurité
- Configuration des accès réseau dans MongoDB Atlas

### Migration des données vers MongoDB

Si vous migrez depuis des fichiers JSON vers MongoDB :

```bash
npm run migrate:mongodb
```

📚 **Guide de migration** : Voir [MONGODB_MIGRATION.md](MONGODB_MIGRATION.md)

## 🚀 Déploiement

### Vercel (recommandé)

```bash
npm run build
```

Puis déployez sur [Vercel](https://vercel.com) en connectant votre repository GitHub.

### GitHub Pages

Configurez `next.config.ts` pour l'export statique :

```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

## 📄 License

© 2026 Loic Mazagran. Tous droits réservés.
