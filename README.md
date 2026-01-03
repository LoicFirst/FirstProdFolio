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

## 🛠️ Installation

```bash
# Cloner le repository
git clone https://github.com/LoicFirst/FirstProdFolio.git

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

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
