import { NextResponse } from 'next/server';
import { users } from '@clerk/clerk-sdk-node';

export async function POST(request: Request) {
  try {
    const { userId, metadata } = await request.json();
    if (!userId || !metadata) {
      return NextResponse.json({ error: 'userId and metadata are required' }, { status: 400 });
    }
    await users.updateUser(userId, {
      publicMetadata: metadata,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update publicMetadata' }, { status: 500 });
  }
} 