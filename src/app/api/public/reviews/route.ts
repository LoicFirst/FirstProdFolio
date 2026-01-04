import { NextRequest, NextResponse } from 'next/server';
import { getReviewsCollection, getSettingsCollection } from '@/lib/storage/database';
import { cache, CACHE_TTL } from '@/lib/cache';
import { ReviewDocument, SettingsDocument } from '@/lib/storage/types';

const CACHE_KEY_PREFIX = 'public:reviews';
const CACHE_KEY_SETTINGS = 'public:reviews:settings';

type CleanReview = Omit<ReviewDocument, '_id'>;

interface ReviewsResponse {
  reviews: CleanReview[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * GET - Get all approved reviews for public display
 * This route reads from database with caching to ensure good performance
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/public/reviews');
  
  try {
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cacheKey = `${CACHE_KEY_PREFIX}:${page}:${limit}`;
    
    // Check if reviews are enabled (with caching)
    let settings = cache.get<SettingsDocument>(CACHE_KEY_SETTINGS);
    if (!settings) {
      const settingsCollection = getSettingsCollection();
      settings = await settingsCollection.findOne({ docId: 'main' });
      if (settings) {
        cache.set(CACHE_KEY_SETTINGS, settings, CACHE_TTL.MEDIUM);
      }
    }
    
    if (settings && settings.reviewsEnabled === false) {
      return NextResponse.json(
        { reviews: [], message: 'Reviews are currently disabled' },
        {
          headers: {
            'Cache-Control': 'public, max-age=60',
          },
        }
      );
    }
    
    // Try to get from cache first
    const cached = cache.get<ReviewsResponse>(cacheKey);
    if (cached) {
      console.log('[API] ✓ Returning cached reviews');
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }
    
    const collection = getReviewsCollection();
    
    // Only get approved reviews for public display
    const cursor = await collection.find({ status: 'approved' });
    const allReviews = await cursor.toArray();
    
    const skip = (page - 1) * limit;
    
    // Sort by created_at descending and paginate
    const sortedReviews = allReviews.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    const totalCount = sortedReviews.length;
    const reviews = sortedReviews.slice(skip, skip + limit);
    
    // Remove database _id field from results
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleanReviews: CleanReview[] = reviews.map(({ _id, ...review }) => review);
    
    const responseData: ReviewsResponse = { 
      reviews: cleanReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + reviews.length < totalCount,
      }
    };
    
    // Cache the results
    cache.set(cacheKey, responseData, CACHE_TTL.SHORT);
    
    console.log('[API] ✓ Retrieved', cleanReviews.length, 'approved reviews from database');
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[API] Error reading reviews from database:', error);
    
    // Try to return stale cache on error
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cacheKey = `${CACHE_KEY_PREFIX}:${page}:${limit}`;
    const staleCache = cache.get<ReviewsResponse>(cacheKey);
    
    if (staleCache) {
      console.log('[API] ⚠️ Returning stale cache due to error');
      return NextResponse.json(staleCache, {
        headers: {
          'Cache-Control': 'public, max-age=10',
          'X-Cache': 'STALE',
        },
      });
    }
    
    // Return empty array instead of error - client will use sample reviews
    return NextResponse.json(
      { reviews: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasMore: false } },
      {
        headers: {
          'Cache-Control': 'public, max-age=10',
        },
      }
    );
  }
}

/**
 * POST - Submit a new review (public, no auth required)
 * Reviews are created with 'pending' status and require admin approval
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/public/reviews');
  
  try {
    // Check if reviews are enabled
    const settingsCollection = getSettingsCollection();
    const settings = await settingsCollection.findOne({ docId: 'main' });
    
    if (settings && settings.reviewsEnabled === false) {
      return NextResponse.json(
        { error: 'Review submissions are currently disabled' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.profession || !body.review_text) {
      return NextResponse.json(
        { error: 'Name, profession, and review text are required' },
        { status: 400 }
      );
    }
    
    // Validate review text length
    if (body.review_text.length < 10) {
      return NextResponse.json(
        { error: 'Review text must be at least 10 characters long' },
        { status: 400 }
      );
    }
    
    if (body.review_text.length > 2000) {
      return NextResponse.json(
        { error: 'Review text must be less than 2000 characters' },
        { status: 400 }
      );
    }
    
    // Validate rating if provided
    if (body.rating !== undefined) {
      const rating = parseInt(body.rating, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
    }
    
    const collection = getReviewsCollection();
    
    // Generate a unique ID
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const id = `review-${Date.now()}-${randomSuffix}`;
    const now = new Date().toISOString();
    
    const newReview = {
      id,
      name: body.name.trim(),
      profession: body.profession.trim(),
      photo_url: body.photo_url || undefined,
      review_text: body.review_text.trim(),
      rating: body.rating ? parseInt(body.rating, 10) : undefined,
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    };
    
    await collection.insertOne(newReview);
    
    // Note: No cache clearing needed here since new reviews require admin approval
    // They won't appear on public site until approved, at which point admin route clears cache
    
    console.log('[API] ✓ New review submitted:', id);
    
    return NextResponse.json(
      { 
        message: 'Review submitted successfully. It will be visible after admin approval.',
        review: { id, name: newReview.name }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating review:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
