import { query, TABLES } from './aurora';
import { 
  AboutDocument, 
  ContactDocument, 
  PhotoDocument, 
  VideoDocument, 
  ReviewDocument, 
  SettingsDocument,
  ReviewStatus 
} from './types';

/**
 * PostgreSQL storage layer for portfolio data
 * This module provides the same interface as MongoDB but uses Aurora PostgreSQL
 */

// Helper to convert snake_case from DB to camelCase for frontend
// Note: For large datasets, consider implementing these as streaming transformations
// or caching transformed objects for better performance
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Helper to convert camelCase to snake_case for DB
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

/**
 * About Collection Operations
 * 
 * Note: Table names (TABLES.ABOUT, etc.) are constants defined in aurora.ts
 * and are safe from SQL injection. They are not user-provided input.
 */
export const aboutOperations = {
  async findOne(): Promise<AboutDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.ABOUT} WHERE doc_id = $1 LIMIT 1`,
      ['about-data']
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      docId: row.doc_id,
      profile: row.profile,
      skills: row.skills,
      software: row.software,
      achievements: row.achievements,
    } as AboutDocument;
  },

  async updateOne(data: Partial<AboutDocument>): Promise<void> {
    const { docId, ...fields } = data;
    
    await query(
      `INSERT INTO ${TABLES.ABOUT} (doc_id, profile, skills, software, achievements)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (doc_id) 
       DO UPDATE SET 
         profile = COALESCE($2, ${TABLES.ABOUT}.profile),
         skills = COALESCE($3, ${TABLES.ABOUT}.skills),
         software = COALESCE($4, ${TABLES.ABOUT}.software),
         achievements = COALESCE($5, ${TABLES.ABOUT}.achievements),
         updated_at = CURRENT_TIMESTAMP`,
      [
        'about-data',
        fields.profile ? JSON.stringify(fields.profile) : null,
        fields.skills ? JSON.stringify(fields.skills) : null,
        fields.software ? JSON.stringify(fields.software) : null,
        fields.achievements ? JSON.stringify(fields.achievements) : null,
      ]
    );
  },
};

/**
 * Contact Collection Operations
 */
export const contactOperations = {
  async findOne(): Promise<ContactDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.CONTACT} WHERE doc_id = $1 LIMIT 1`,
      ['contact-data']
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      docId: row.doc_id,
      contact: row.contact,
      social: row.social,
      availability: row.availability,
    } as ContactDocument;
  },

  async updateOne(data: Partial<ContactDocument>): Promise<void> {
    const { docId, ...fields } = data;
    
    await query(
      `INSERT INTO ${TABLES.CONTACT} (doc_id, contact, social, availability)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (doc_id) 
       DO UPDATE SET 
         contact = COALESCE($2, ${TABLES.CONTACT}.contact),
         social = COALESCE($3, ${TABLES.CONTACT}.social),
         availability = COALESCE($4, ${TABLES.CONTACT}.availability),
         updated_at = CURRENT_TIMESTAMP`,
      [
        'contact-data',
        fields.contact ? JSON.stringify(fields.contact) : null,
        fields.social ? JSON.stringify(fields.social) : null,
        fields.availability ? JSON.stringify(fields.availability) : null,
      ]
    );
  },
};

/**
 * Settings Collection Operations
 */
export const settingsOperations = {
  async findOne(): Promise<SettingsDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.SETTINGS} WHERE doc_id = $1 LIMIT 1`,
      ['settings-data']
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      docId: row.doc_id,
      lightWaveEffect: row.light_wave_effect,
      reviewsEnabled: row.reviews_enabled,
    } as SettingsDocument;
  },

  async updateOne(data: Partial<SettingsDocument>): Promise<void> {
    await query(
      `INSERT INTO ${TABLES.SETTINGS} (doc_id, light_wave_effect, reviews_enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (doc_id) 
       DO UPDATE SET 
         light_wave_effect = COALESCE($2, ${TABLES.SETTINGS}.light_wave_effect),
         reviews_enabled = COALESCE($3, ${TABLES.SETTINGS}.reviews_enabled),
         updated_at = CURRENT_TIMESTAMP`,
      [
        'settings-data',
        data.lightWaveEffect !== undefined ? data.lightWaveEffect : null,
        data.reviewsEnabled !== undefined ? data.reviewsEnabled : null,
      ]
    );
  },
};

/**
 * Photos Collection Operations
 */
export const photosOperations = {
  async find(): Promise<PhotoDocument[]> {
    const result = await query(
      `SELECT * FROM ${TABLES.PHOTOS} ORDER BY created_at DESC`
    );
    
    return result.rows.map(row => toCamelCase(row) as PhotoDocument);
  },

  async findById(id: string): Promise<PhotoDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.PHOTOS} WHERE id = $1 LIMIT 1`,
      [id]
    );
    
    return result.rows.length > 0 ? toCamelCase(result.rows[0]) as PhotoDocument : null;
  },

  async insertOne(photo: PhotoDocument): Promise<void> {
    const snakePhoto = toSnakeCase(photo);
    await query(
      `INSERT INTO ${TABLES.PHOTOS} 
       (id, title, description, year, image_url, thumbnail_url, category, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        snakePhoto.id,
        snakePhoto.title,
        snakePhoto.description,
        snakePhoto.year || null,
        snakePhoto.image_url,
        snakePhoto.thumbnail_url || null,
        snakePhoto.category || null,
        snakePhoto.location || null,
      ]
    );
  },

  async updateOne(id: string, updates: Partial<PhotoDocument>): Promise<{ modifiedCount: number }> {
    const snakeUpdates = toSnakeCase(updates);
    const fields = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(', ');
    
    const values = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map(key => snakeUpdates[key]);
    
    const result = await query(
      `UPDATE ${TABLES.PHOTOS} SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id, ...values]
    );
    
    return { modifiedCount: result.rowCount || 0 };
  },

  async deleteOne(id: string): Promise<{ deletedCount: number }> {
    const result = await query(`DELETE FROM ${TABLES.PHOTOS} WHERE id = $1`, [id]);
    return { deletedCount: result.rowCount || 0 };
  },
};

/**
 * Videos Collection Operations
 */
export const videosOperations = {
  async find(): Promise<VideoDocument[]> {
    const result = await query(
      `SELECT * FROM ${TABLES.VIDEOS} ORDER BY created_at DESC`
    );
    
    return result.rows.map(row => toCamelCase(row) as VideoDocument);
  },

  async findById(id: string): Promise<VideoDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.VIDEOS} WHERE id = $1 LIMIT 1`,
      [id]
    );
    
    return result.rows.length > 0 ? toCamelCase(result.rows[0]) as VideoDocument : null;
  },

  async insertOne(video: VideoDocument): Promise<void> {
    const snakeVideo = toSnakeCase(video);
    await query(
      `INSERT INTO ${TABLES.VIDEOS} 
       (id, title, description, year, video_url, thumbnail_url, duration, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        snakeVideo.id,
        snakeVideo.title,
        snakeVideo.description,
        snakeVideo.year || null,
        snakeVideo.video_url,
        snakeVideo.thumbnail_url || null,
        snakeVideo.duration || null,
        snakeVideo.category || null,
      ]
    );
  },

  async updateOne(id: string, updates: Partial<VideoDocument>): Promise<{ modifiedCount: number }> {
    const snakeUpdates = toSnakeCase(updates);
    const fields = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(', ');
    
    const values = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map(key => snakeUpdates[key]);
    
    const result = await query(
      `UPDATE ${TABLES.VIDEOS} SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id, ...values]
    );
    
    return { modifiedCount: result.rowCount || 0 };
  },

  async deleteOne(id: string): Promise<{ deletedCount: number }> {
    const result = await query(`DELETE FROM ${TABLES.VIDEOS} WHERE id = $1`, [id]);
    return { deletedCount: result.rowCount || 0 };
  },
};

/**
 * Reviews Collection Operations
 */
export const reviewsOperations = {
  async find(filter?: { status?: ReviewStatus }): Promise<ReviewDocument[]> {
    let sql = `SELECT * FROM ${TABLES.REVIEWS}`;
    const params: any[] = [];
    
    if (filter?.status) {
      sql += ' WHERE status = $1';
      params.push(filter.status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    return result.rows.map(row => toCamelCase(row) as ReviewDocument);
  },

  async findById(id: string): Promise<ReviewDocument | null> {
    const result = await query(
      `SELECT * FROM ${TABLES.REVIEWS} WHERE id = $1 LIMIT 1`,
      [id]
    );
    
    return result.rows.length > 0 ? toCamelCase(result.rows[0]) as ReviewDocument : null;
  },

  async insertOne(review: ReviewDocument): Promise<void> {
    const snakeReview = toSnakeCase(review);
    await query(
      `INSERT INTO ${TABLES.REVIEWS} 
       (id, name, profession, photo_url, review_text, rating, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        snakeReview.id,
        snakeReview.name,
        snakeReview.profession || null,
        snakeReview.photo_url || null,
        snakeReview.review_text,
        snakeReview.rating || null,
        snakeReview.status || 'pending',
        snakeReview.created_at || new Date().toISOString(),
        snakeReview.updated_at || new Date().toISOString(),
      ]
    );
  },

  async updateOne(id: string, updates: Partial<ReviewDocument>): Promise<{ modifiedCount: number }> {
    const snakeUpdates = toSnakeCase(updates);
    const fields = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(', ');
    
    const values = Object.keys(snakeUpdates)
      .filter(key => key !== 'id')
      .map(key => snakeUpdates[key]);
    
    const result = await query(
      `UPDATE ${TABLES.REVIEWS} SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id, ...values]
    );
    
    return { modifiedCount: result.rowCount || 0 };
  },

  async deleteOne(id: string): Promise<{ deletedCount: number }> {
    const result = await query(`DELETE FROM ${TABLES.REVIEWS} WHERE id = $1`, [id]);
    return { deletedCount: result.rowCount || 0 };
  },
};
