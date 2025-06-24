import { NextResponse } from 'next/server';
import { getAllDoctors } from '@/utils/services/doctor';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    const res = await getAllDoctors({ 
      page, 
      limit,
      search 
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error('Error in doctors/all route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', status: 500 },
      { status: 500 }
    );
  }
} 