import fs from 'fs';
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
  
  try {
    // Check if file exists
    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.error('[JSON-DB] CRITICAL ERROR: data.json file does not exist');
      console.error('[JSON-DB] Expected path:', DATA_FILE_PATH);
      console.error('[JSON-DB] Please create data.json from data.json.example');
      console.error('[JSON-DB] Instructions:');
      console.error('[JSON-DB]   1. Copy data.json.example to data.json');
      console.error('[JSON-DB]   2. Update admin credentials in data.json');
      throw new Error('data.json file not found. Please create it from data.json.example with your own credentials.');
    }
    
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    console.log('[JSON-DB] ✓ File read successfully, length:', fileContent.length);
    
    const parsedData = JSON.parse(fileContent);
    console.log('[JSON-DB] ✓ JSON parsed successfully');
    console.log('[JSON-DB] Data structure check:');
    console.log('[JSON-DB]   - admin exists:', !!parsedData.admin);
    console.log('[JSON-DB]   - admin.email exists:', !!parsedData.admin?.email);
    console.log('[JSON-DB]   - admin.password exists:', !!parsedData.admin?.password);
    console.log('[JSON-DB]   - projects exists:', !!parsedData.projects);
    console.log('[JSON-DB]   - projects count:', parsedData.projects?.length || 0);
    
    return parsedData;
  } catch (error) {
    console.error('[JSON-DB] ========================================');
    console.error('[JSON-DB] ERROR reading data file');
    console.error('[JSON-DB] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[JSON-DB] Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('[JSON-DB] Stack trace:', error.stack);
    }
    console.error('[JSON-DB] ========================================');
    
    // Provide helpful error messages
    if (error instanceof SyntaxError) {
      console.error('[JSON-DB] The data.json file contains invalid JSON syntax');
      console.error('[JSON-DB] Please check for:');
      console.error('[JSON-DB]   - Missing commas between properties');
      console.error('[JSON-DB]   - Missing quotes around strings');
      console.error('[JSON-DB]   - Trailing commas');
      throw new Error('data.json file contains invalid JSON syntax. Please check the file format.');
    }
    
    throw new Error('data.json file not found or cannot be read. Please create it from data.json.example with your own credentials.');
  }
}

/**
 * Write data to JSON file with lock
 */
export async function writeData(data: DatabaseData): Promise<void> {
  console.log('[JSON-DB] Writing data to:', DATA_FILE_PATH);
  console.log('[JSON-DB] Projects count:', data.projects?.length || 0);
  
  await acquireWriteLock();
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[JSON-DB] ✓ Data written successfully to filesystem');
  } catch (error) {
    console.error('[JSON-DB] Error writing data file:', error);
    throw new Error('Failed to write data to file');
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
