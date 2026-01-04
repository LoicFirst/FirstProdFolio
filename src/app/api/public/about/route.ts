import { NextResponse } from 'next/server';
import { getAboutCollection } from '@/lib/storage/database';
import { AboutDocument } from '@/lib/storage/types';
import { cache, CACHE_TTL } from '@/lib/cache';

const CACHE_KEY = 'public:about';

// Default about data when database is not available
const DEFAULT_ABOUT_DATA = {
  profile: {
    name: "Loic Mazagran",
    title: "Réalisateur & Créateur de Contenus Visuels",
    bio: "Réalisateur et monteur avec plus de 5 ans d'expérience dans la création de courts-métrages et contenus artistiques. Passionné par le cinéma depuis mon plus jeune âge, j'ai développé un style visuel unique qui mêle narration émotionnelle et esthétique soignée.",
    experience_years: 5,
    location: "France"
  },
  skills: [
    { category: "Réalisation", items: ["Direction artistique", "Mise en scène", "Storyboarding"] },
    { category: "Post-production", items: ["Montage vidéo", "Étalonnage", "Effets visuels"] },
    { category: "Photographie", items: ["Portrait", "Paysage", "Urbain"] },
    { category: "Technique", items: ["Éclairage", "Prise de son", "Cadrage"] }
  ],
  software: [
    { name: "Adobe Premiere Pro", level: 95 },
    { name: "DaVinci Resolve", level: 90 },
    { name: "After Effects", level: 85 },
    { name: "Photoshop", level: 80 },
    { name: "Lightroom", level: 85 },
    { name: "Final Cut Pro", level: 75 }
  ],
  achievements: [
    { year: 2024, title: "Meilleur Court-Métrage", event: "Festival du Film Court de Paris" },
    { year: 2023, title: "Prix du Public", event: "Rencontres Cinématographiques" },
    { year: 2022, title: "Sélection Officielle", event: "Festival International du Film" }
  ]
};

/**
 * GET - Get about data for public display
 * This route reads from database with caching to ensure good performance
 * while still allowing real-time synchronization with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/about');
  
  try {
    // Try to get from cache first
    const cached = cache.get<typeof DEFAULT_ABOUT_DATA>(CACHE_KEY);
    if (cached) {
      console.log('[API] ✓ Returning cached about data');
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from database with timeout
    const collection = getAboutCollection();
    const aboutDoc = await collection.findOne({ docId: 'about-data' });
    
    // Remove database internal fields
    let data = DEFAULT_ABOUT_DATA;
    if (aboutDoc) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, docId, ...about }: Partial<AboutDocument> = aboutDoc;
      data = about as typeof DEFAULT_ABOUT_DATA;
    }
    
    // If no data found or data is empty, use default data
    if (!aboutDoc || Object.keys(data).length === 0) {
      console.log('[API] No about data found, using defaults');
      data = DEFAULT_ABOUT_DATA;
    }
    
    // Cache the results
    cache.set(CACHE_KEY, data, CACHE_TTL.MEDIUM);
    
    console.log('[API] ✓ Retrieved about data from database');
    
    // Return with cache control headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[API] Error reading about data from database:', error);
    
    // Try to return stale cache on error
    const staleCache = cache.get<typeof DEFAULT_ABOUT_DATA>(CACHE_KEY);
    if (staleCache) {
      console.log('[API] ⚠️ Returning stale cache due to error');
      return NextResponse.json(staleCache, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'STALE',
        },
      });
    }
    
    // Return default data on error
    console.log('[API] Returning default about data due to error');
    return NextResponse.json(DEFAULT_ABOUT_DATA, {
      headers: {
        'Cache-Control': 'public, max-age=30',
      },
    });
  }
}
