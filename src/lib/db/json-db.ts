import { readJSONFile, writeJSONFile } from '@/lib/filesystem';
import path from 'path';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');

// Simple mutex lock for file operations
let isWriting = false;
const writeQueue: (() => void)[] = [];

async function acquireWriteLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!isWriting) {
      isWriting = true;
      resolve();
    } else {
      writeQueue.push(() => {
        isWriting = true;
        resolve();
      });
    }
  });
}

function releaseWriteLock(): void {
  isWriting = false;
  const next = writeQueue.shift();
  if (next) {
    next();
  }
}

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
  console.log('[JSON-DB] Reading data from:', DATA_FILE_PATH);
  return readJSONFile<DatabaseData>(DATA_FILE_PATH);
}

/**
 * Write data to JSON file with lock
 */
export async function writeData(data: DatabaseData): Promise<void> {
  console.log('[JSON-DB] Writing data to:', DATA_FILE_PATH);
  console.log('[JSON-DB] Projects count:', data.projects?.length || 0);
  
  await acquireWriteLock();
  try {
    writeJSONFile(DATA_FILE_PATH, data);
  } finally {
    releaseWriteLock();
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
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
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
  await writeData(data);
  
  console.log('[JSON-DB] ✓ Project created:', newId);
  return newProject;
}

/**
 * Update a project
 */
export async function updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
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
  
  await writeData(data);
  console.log('[JSON-DB] ✓ Project updated:', id);
  return data.projects[index];
}

/**
 * Delete a project
 */
export async function deleteProject(id: number): Promise<boolean> {
  const data = readData();
  const initialLength = data.projects.length;
  
  data.projects = data.projects.filter((project) => project.id !== id);
  
  if (data.projects.length === initialLength) {
    console.error('[JSON-DB] Project not found for deletion:', id);
    return false;
  }
  
  await writeData(data);
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
