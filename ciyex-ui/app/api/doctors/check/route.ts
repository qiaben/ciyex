import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if doctor exists in database
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: userId
      },
      select: {
        id: true,
        type: true,
        availability_status: true
      }
    });

    if (!doctor) {
      return NextResponse.json({ 
        exists: false,
        status: null
      });
    }

    return NextResponse.json({
      exists: true,
      status: doctor.availability_status || (doctor.type === 'FULL' ? 'approved' : 'pending')
    });

  } catch (error) {
    console.error('Error checking doctor:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check doctor status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 