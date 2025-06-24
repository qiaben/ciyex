import { auth as getAuth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

export const auth = getAuth;

export async function getUserId() {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return userId;
} 

export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  
  return {
    id: userId,
    role: sessionClaims?.metadata?.role as string || 'PATIENT',
  };
} 