import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Doctor id is required' }, { status: 400 });
    }

    // Delete the doctor from the database
    await db.doctor.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete doctor' }, { status: 500 });
  }
} 