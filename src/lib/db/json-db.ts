import fs from 'fs';
import path from 'path';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');

export interface Project {
  id: number;
  title: string;
  description: string;
  video?: string;
  images: string[];
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  email: string;
  password: string;
}

export interface DatabaseData {
  projects: Project[];
  admin: Admin;
}

/**
 * Read data from JSON file
 */
export function readData(): DatabaseData {
  try {
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('[JSON-DB] Error reading data file:', error);
    // Return default structure if file doesn't exist or is corrupted
    return {
      projects: [],
      admin: {
        email: 'loicmazagran2007@gmail.com',
        password: '$2b$10$VXrCb7vqpNjznoeiPs/SE.i1aF7p9d7C963dtvZZb.5fX2wcwyZFC',
      },
    };
  }
}

/**
 * Write data to JSON file
 */
export function writeData(data: DatabaseData): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[JSON-DB] ✓ Data written successfully');
  } catch (error) {
    console.error('[JSON-DB] Error writing data file:', error);
    throw new Error('Failed to write data to file');
  }
}

/**
 * Get all projects
 */
export function getProjects(): Project[] {
  const data = readData();
  return data.projects;
}

/**
 * Get project by ID
 */
export function getProjectById(id: number): Project | undefined {
  const data = readData();
  return data.projects.find((project) => project.id === id);
}

/**
 * Create a new project
 */
export function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const data = readData();
  
  // Generate new ID
  const newId = data.projects.length > 0 
    ? Math.max(...data.projects.map(p => p.id)) + 1 
    : 1;
  
  const newProject: Project = {
    ...project,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.projects.push(newProject);
  writeData(data);
  
  console.log('[JSON-DB] ✓ Project created:', newId);
  return newProject;
}

/**
 * Update a project
 */
export function updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  const data = readData();
  const index = data.projects.findIndex((project) => project.id === id);
  
  if (index === -1) {
    console.error('[JSON-DB] Project not found:', id);
    return null;
  }
  
  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };
  
  writeData(data);
  console.log('[JSON-DB] ✓ Project updated:', id);
  return data.projects[index];
}

/**
 * Delete a project
 */
export function deleteProject(id: number): boolean {
  const data = readData();
  const initialLength = data.projects.length;
  
  data.projects = data.projects.filter((project) => project.id !== id);
  
  if (data.projects.length === initialLength) {
    console.error('[JSON-DB] Project not found for deletion:', id);
    return false;
  }
  
  writeData(data);
  console.log('[JSON-DB] ✓ Project deleted:', id);
  return true;
}

/**
 * Get admin credentials
 */
export function getAdmin(): Admin {
  const data = readData();
  return data.admin;
}
