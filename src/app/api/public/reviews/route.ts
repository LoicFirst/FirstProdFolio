import { NextRequest, NextResponse } from 'next/server';
import { getReviewsCollection, getSettingsCollection } from '@/lib/storage/mongodb';

/**
 * GET - Get all approved reviews for public display
 * This route reads from MongoDB to show approved client reviews
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/public/reviews');
  
  try {
    // Check if reviews are enabled
    const settingsCollection = await getSettingsCollection();
    const settings = await settingsCollection.findOne({ docId: 'main' });
    
    if (settings && settings.reviewsEnabled === false) {
      return NextResponse.json(
        { reviews: [], message: 'Reviews are currently disabled' },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
          },
        }
      );
    }
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    const collection = await getReviewsCollection();
    
    // Only get approved reviews for public display
    const totalCount = await collection.countDocuments({ status: 'approved' });
    const reviews = await collection
      .find({ status: 'approved' })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Remove MongoDB _id field from results
    const cleanReviews = reviews.map(({ _id, ...review }) => review);
    
    console.log('[API] ✓ Retrieved', cleanReviews.length, 'approved reviews from MongoDB');
    
    return NextResponse.json(
      { 
        reviews: cleanReviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + reviews.length < totalCount,
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error reading reviews from MongoDB:', error);
    
    // Return empty array instead of error - client will use sample reviews
    return NextResponse.json(
      { reviews: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasMore: false } },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
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
    const settingsCollection = await getSettingsCollection();
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
    
    const collection = await getReviewsCollection();
    
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
