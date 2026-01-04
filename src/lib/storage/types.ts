import { Document } from 'mongodb';

/**
 * MongoDB document types for portfolio data
 * These extend the base Document type from MongoDB
 */

// Base document with docId for single-document collections
export interface MongoDocumentWithId extends Document {
  docId: string;
}

// About data MongoDB document
export interface AboutDocument extends MongoDocumentWithId {
  profile?: {
    name?: string;
    title?: string;
    bio?: string;
    photo_url?: string;
    experience_years?: number;
    location?: string;
  };
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  software?: Array<{
    name: string;
    level: number;
    icon?: string;
  }>;
  achievements?: Array<{
    year: number;
    title: string;
    event: string;
  }>;
}

// Contact data MongoDB document
export interface ContactDocument extends MongoDocumentWithId {
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
  };
  social?: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  availability?: {
    status: string;
    message: string;
  };
}

// Photo MongoDB document
export interface PhotoDocument extends Document {
  id: string;
  title: string;
  description: string;
  year?: number;
  image_url: string;
  thumbnail_url?: string;
  category?: string;
  location?: string;
}

// Video MongoDB document
export interface VideoDocument extends Document {
  id: string;
  title: string;
  description: string;
  year?: number;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  category?: string;
}

// Review MongoDB document
export interface ReviewDocument extends Document {
  id: string;
  name: string;
  profession: string;
  photo_url?: string;
  review_text: string;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Site Settings MongoDB document
export interface SettingsDocument extends MongoDocumentWithId {
  lightWaveEffect: boolean;
  reviewsEnabled: boolean;
}
