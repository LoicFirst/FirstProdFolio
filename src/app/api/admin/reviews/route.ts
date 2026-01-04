import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError, logApiRequest } from '@/lib/api-helpers';
import { getReviewsCollection } from '@/lib/storage/database';
import { ReviewDocument } from '@/lib/storage/types';

// GET all reviews (admin can see all statuses)
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/admin/reviews');
  
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status: pending, approved, rejected
    
    const collection = getReviewsCollection();
    
    // Get reviews with optional status filter
    const filter = status && ['pending', 'approved', 'rejected'].includes(status) 
      ? { status: status as 'pending' | 'approved' | 'rejected' }
      : undefined;
    
    const allReviews = await collection.find(filter).toArray();
    
    // Remove database _id field from results
    const cleanReviews = allReviews.map(({ _id, ...review }) => review);
    
    // Get counts by status for dashboard
    const pendingCount = cleanReviews.filter(r => r.status === 'pending').length;
    const approvedCount = cleanReviews.filter(r => r.status === 'approved').length;
    const rejectedCount = cleanReviews.filter(r => r.status === 'rejected').length;
    
    console.log(`[API] ✓ Retrieved ${cleanReviews.length} reviews from database`);
    
    return NextResponse.json({
      reviews: cleanReviews,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: cleanReviews.length,
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

    const collection = getReviewsCollection();
    
    // Add updated timestamp
    const now = new Date().toISOString();
    const update: Partial<ReviewDocument> = {
      ...updateData,
      id, // Ensure ID doesn't change
      updated_at: now,
    };
    
    await collection.updateOne(
      { id },
      { $set: update }
    );

    const updatedReview = { ...updateData, id, updated_at: now };
    console.log('[API] ✓ Review updated successfully in database:', id);
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

    const collection = getReviewsCollection();
    await collection.deleteOne({ id });

    console.log('[API] ✓ Review deleted successfully from database:', id);
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

    const collection = getReviewsCollection();
    
    // Update each review individually (simplified for PostgreSQL compatibility)
    let modifiedCount = 0;
    for (const id of ids) {
      try {
        await collection.updateOne(
          { id },
          { $set: { status: newStatus, updated_at: now } }
        );
        modifiedCount++;
      } catch (err) {
        console.error(`[API] Failed to update review ${id}:`, err);
      }
    }

    console.log('[API] ✓ Bulk action completed:', modifiedCount, 'reviews updated');
    
    return NextResponse.json({
      message: `Successfully ${action}d ${modifiedCount} review(s)`,
      modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/reviews');
  }
}
