/**
 * Database storage module for portfolio data
 * This module provides a unified interface for database operations using Aurora PostgreSQL
 */

import {
  aboutOperations,
  contactOperations,
  settingsOperations,
  photosOperations,
  videosOperations,
  reviewsOperations,
} from './postgres-operations';

import { checkConnection } from './aurora';

// Export collection names for consistency
export const COLLECTIONS = {
  ABOUT: 'about',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  CONTACT: 'contact',
  REVIEWS: 'reviews',
  SETTINGS: 'settings',
} as const;

/**
 * Get the about collection interface
 */
export function getAboutCollection() {
  return {
    async findOne(filter: { docId: string }) {
      return aboutOperations.findOne();
    },
    async updateOne(
      filter: { docId: string },
      update: { $set: any },
      options?: { upsert: boolean }
    ) {
      return aboutOperations.updateOne(update.$set);
    },
  };
}

/**
 * Get the contact collection interface
 */
export function getContactCollection() {
  return {
    async findOne(filter: { docId: string }) {
      return contactOperations.findOne();
    },
    async updateOne(
      filter: { docId: string },
      update: { $set: any },
      options?: { upsert: boolean }
    ) {
      return contactOperations.updateOne(update.$set);
    },
  };
}

/**
 * Get the settings collection interface
 */
export function getSettingsCollection() {
  return {
    async findOne(filter: { docId: string }) {
      return settingsOperations.findOne();
    },
    async updateOne(
      filter: { docId: string },
      update: { $set: any },
      options?: { upsert: boolean }
    ) {
      return settingsOperations.updateOne(update.$set);
    },
  };
}

/**
 * Get the photos collection interface
 */
export function getPhotosCollection() {
  return {
    async find(filter?: any) {
      const photos = await photosOperations.find();
      return {
        toArray: async () => photos,
      };
    },
    async findOne(filter: { id: string }) {
      return photosOperations.findById(filter.id);
    },
    async insertOne(photo: any) {
      return photosOperations.insertOne(photo);
    },
    async updateOne(filter: { id: string }, update: { $set: any }) {
      return photosOperations.updateOne(filter.id, update.$set);
    },
    async deleteOne(filter: { id: string }) {
      return photosOperations.deleteOne(filter.id);
    },
  };
}

/**
 * Get the videos collection interface
 */
export function getVideosCollection() {
  return {
    async find(filter?: any) {
      const videos = await videosOperations.find();
      return {
        toArray: async () => videos,
      };
    },
    async findOne(filter: { id: string }) {
      return videosOperations.findById(filter.id);
    },
    async insertOne(video: any) {
      return videosOperations.insertOne(video);
    },
    async updateOne(filter: { id: string }, update: { $set: any }) {
      return videosOperations.updateOne(filter.id, update.$set);
    },
    async deleteOne(filter: { id: string }) {
      return videosOperations.deleteOne(filter.id);
    },
  };
}

/**
 * Get the reviews collection interface
 */
export function getReviewsCollection() {
  return {
    async find(filter?: any) {
      const reviews = await reviewsOperations.find(filter);
      return {
        toArray: async () => reviews,
      };
    },
    async findOne(filter: { id: string }) {
      return reviewsOperations.findById(filter.id);
    },
    async insertOne(review: any) {
      return reviewsOperations.insertOne(review);
    },
    async updateOne(filter: { id: string }, update: { $set: any }) {
      return reviewsOperations.updateOne(filter.id, update.$set);
    },
    async deleteOne(filter: { id: string }) {
      return reviewsOperations.deleteOne(filter.id);
    },
  };
}

/**
 * Health check for database connection
 */
export { checkConnection };

/**
 * Compatibility function for MongoDB-style connection
 * This allows existing code to work without changes
 */
export async function connectToDatabase() {
  // For Aurora, we use connection pooling, so no explicit connection needed
  // This function exists for API compatibility
  console.log('[Database] Using Aurora PostgreSQL connection pool');
  return {
    db: {
      collection: (name: string) => {
        switch (name) {
          case COLLECTIONS.ABOUT:
            return getAboutCollection();
          case COLLECTIONS.CONTACT:
            return getContactCollection();
          case COLLECTIONS.SETTINGS:
            return getSettingsCollection();
          case COLLECTIONS.PHOTOS:
            return getPhotosCollection();
          case COLLECTIONS.VIDEOS:
            return getVideosCollection();
          case COLLECTIONS.REVIEWS:
            return getReviewsCollection();
          default:
            throw new Error(`Unknown collection: ${name}`);
        }
      },
    },
  };
}

/**
 * Close database connection (no-op for Aurora pool, kept for compatibility)
 */
export async function closeConnection(): Promise<void> {
  console.log('[Database] Connection pool will be managed automatically');
}
