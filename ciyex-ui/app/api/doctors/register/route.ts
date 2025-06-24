import { NextResponse } from 'next/server';
import { createNewDoctor } from '@/utils/services/doctor';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received registration data:', data); // Add logging
    
    // Ensure the user ID from auth matches the one in the request
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    const result = await createNewDoctor(data, userId);
    console.log('Doctor creation result:', result); // Add logging
    
    if (!result.success) {
      return NextResponse.json({ error: result.msg }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register doctor' },
      { status: 500 }
    );
  }
} 