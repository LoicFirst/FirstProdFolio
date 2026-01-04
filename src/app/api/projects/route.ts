import { NextRequest, NextResponse } from 'next/server';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from '@/lib/db/json-db';
import { authenticateRequest } from '@/lib/auth/jwt';

// YouTube URL validation regex - matches standard YouTube URLs
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(\?[^\s]*)?$/;

/**
 * POST - Create a new project (protected)
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/projects - Create project');
  
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
  
  try {
    const body = await request.json();
    const { title, description, video, images, url } = body;
    
    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Validate video URL if provided
    if (video && !YOUTUBE_URL_REGEX.test(video)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }
    
    // Create project
    const newProject = await createProject({
      title,
      description,
      video: video || undefined,
      images: images || [],
      url: url || undefined,
    });
    
    console.log('[API] ✓ Project created:', newProject.id);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a project (protected)
 */
export async function PUT(request: NextRequest) {
  console.log('[API] PUT /api/projects - Update project');
  
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
  
  try {
    const body = await request.json();
    const { id, title, description, video, images, url } = body;
    
    // Validate ID
    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Valid project ID is required' },
        { status: 400 }
      );
    }
    
    // Validate video URL if provided
    if (video && !YOUTUBE_URL_REGEX.test(video)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }
    
    // Update project
    const updatedProject = await updateProject(id, {
      title,
      description,
      video,
      images,
      url,
    });
    
    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log('[API] ✓ Project updated:', id);
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('[API] Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a project (protected)
 */
export async function DELETE(request: NextRequest) {
  console.log('[API] DELETE /api/projects - Delete project');
  
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    // Delete project
    const success = await deleteProject(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log('[API] ✓ Project deleted:', id);
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('[API] Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
