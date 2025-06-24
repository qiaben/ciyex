import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json();
    if (!userId || !status) {
      return NextResponse.json({ success: false, message: 'Missing userId or status' }, { status: 400 });
    }
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { status, role: 'doctor' }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
} 