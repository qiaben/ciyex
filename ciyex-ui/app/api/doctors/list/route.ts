import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const doctors = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
} 