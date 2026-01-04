import { NextResponse } from 'next/server';
import { getAboutCollection } from '@/lib/storage/mongodb';
import { AboutDocument } from '@/lib/storage/types';

// Default about data when MongoDB is not available
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
 * This route reads from MongoDB to ensure real-time synchronization
 * with admin dashboard changes
 */
export async function GET() {
  console.log('[API] GET /api/public/about');
  
  try {
    const collection = await getAboutCollection();
    const aboutDoc = await collection.findOne({ docId: 'about-data' });
    
    // Remove MongoDB internal fields
    let data = {};
    if (aboutDoc) {
      const { _id, docId, ...about }: Partial<AboutDocument> = aboutDoc;
      data = about;
    }
    
    // If no data found or data is empty, return default data
    if (!aboutDoc || Object.keys(data).length === 0) {
      console.log('[API] No about data found, returning defaults');
      return NextResponse.json(DEFAULT_ABOUT_DATA, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
    }
    
    console.log('[API] ✓ Retrieved about data from MongoDB');
    
    // Return with cache control headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API] Error reading about data from MongoDB:', error);
    
    // Return default data on error instead of 500
    console.log('[API] Returning default about data due to error');
    return NextResponse.json(DEFAULT_ABOUT_DATA, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  }
}
