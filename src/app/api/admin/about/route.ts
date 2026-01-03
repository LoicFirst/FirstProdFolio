import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import dbConnect from '@/lib/db/mongodb';
import About from '@/models/About';

// GET about data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const about = await About.findOne();

    return NextResponse.json({ about });
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create or update about data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Upsert - create if doesn't exist, update if exists
    const about = await About.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ about }, { status: 200 });
  } catch (error) {
    console.error('Error updating about:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update about data (same as POST for single document)
export async function PUT(request: NextRequest) {
  return POST(request);
}
