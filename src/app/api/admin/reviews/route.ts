import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getReviewsCollection } from '@/lib/storage/mongodb';
import { ReviewDocument } from '@/lib/storage/types';
import { Filter } from 'mongodb';

// GET all reviews (admin can see all statuses)
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/reviews');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status: pending, approved, rejected
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search'); // Search by name or profession
    const skip = (page - 1) * limit;

    const collection = await getReviewsCollection();
    
    // Build query filter
    const query: Filter<ReviewDocument> = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status as 'pending' | 'approved' | 'rejected';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
      ];
    }
    
    const totalCount = await collection.countDocuments(query);
    const reviews = await collection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Remove MongoDB _id field from results
    const cleanReviews = reviews.map(({ _id, ...review }) => review);
    
    // Get counts by status for dashboard
    const pendingCount = await collection.countDocuments({ status: 'pending' });
    const approvedCount = await collection.countDocuments({ status: 'approved' });
    const rejectedCount = await collection.countDocuments({ status: 'rejected' });
    
    console.log(`[API] ✓ Retrieved ${cleanReviews.length} reviews from MongoDB`);
    
    return NextResponse.json({
      reviews: cleanReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + reviews.length < totalCount,
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      }
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/reviews');
  }
}

// PUT update a review (approve, reject, or edit)
export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/admin/reviews');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      console.error('[API] Review ID is missing in update request');
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Validate status if provided
    if (updateData.status && !['pending', 'approved', 'rejected'].includes(updateData.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    console.log('[API] Updating review:', id, 'with status:', updateData.status);

    const collection = await getReviewsCollection();
    
    // Add updated timestamp
    const now = new Date().toISOString();
    const update: Partial<ReviewDocument> = {
      ...updateData,
      id, // Ensure ID doesn't change
      updated_at: now,
    };
    
    const result = await collection.updateOne(
      { id },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      console.error('[API] Review not found:', id);
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updatedReview = { ...updateData, id, updated_at: now };
    console.log('[API] ✓ Review updated successfully in MongoDB:', id);
    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/reviews');
  }
}

// DELETE a review
export async function DELETE(request: NextRequest) {
  logApiRequest('DELETE', '/api/admin/reviews');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('[API] Review ID is missing in delete request');
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    console.log('[API] Deleting review:', id);

    const collection = await getReviewsCollection();
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      console.error('[API] Review not found for deletion:', id);
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    console.log('[API] ✓ Review deleted successfully from MongoDB:', id);
    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/reviews');
  }
}

// POST - Bulk action (approve/reject multiple reviews)
export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/admin/reviews');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { action, ids } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Review IDs array is required' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    console.log('[API] Bulk', action, 'for', ids.length, 'reviews');

    const collection = await getReviewsCollection();
    const result = await collection.updateMany(
      { id: { $in: ids } },
      { $set: { status: newStatus, updated_at: now } }
    );

    console.log('[API] ✓ Bulk action completed:', result.modifiedCount, 'reviews updated');
    
    return NextResponse.json({
      message: `Successfully ${action}d ${result.modifiedCount} review(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/reviews');
  }
}
