import { NextResponse } from 'next/server';
import { updateDoctor } from '@/utils/services/doctor';
import { auth } from '@clerk/nextjs/server';
import { withDatabaseConnection } from '@/utils/database';
import db from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Log the incoming data for debugging
    console.log('Doctor update request data:', {
      userId: data.userId,
      authenticatedUserId: userId,
      working_days: data.working_days,
      working_days_length: data.working_days?.length
    });
    
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Check if doctor exists before attempting update (for logging purposes)
    const existingDoctor = await db.doctor.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    console.log('Doctor existence check:', {
      userId,
      doctorExists: !!existingDoctor,
      doctorData: existingDoctor
    });

    const result = await updateDoctor(data, userId);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.msg || 'Failed to update doctor' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.msg 
    });
  } catch (error: any) {
    console.error('Doctor update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update doctor' },
      { status: 500 }
    );
  }
} 