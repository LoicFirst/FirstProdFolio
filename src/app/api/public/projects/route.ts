import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/db/json-db';

/**
 * GET - Get all projects for public display
 * This route is public and does not require authentication
 */
export async function GET() {
  console.log('[API] GET /api/public/projects');
  
  try {
    const projects = getProjects();
    
    console.log('[API] ✓ Retrieved', projects.length, 'projects');
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[API] Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
