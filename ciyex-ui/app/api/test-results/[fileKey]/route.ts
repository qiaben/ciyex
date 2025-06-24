import { NextResponse } from 'next/server';
import { auth, getCurrentUser } from '@/lib/auth';
import { generateDownloadUrl } from '@/lib/aws-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileKey: string }> }
) {
  try {
    const { fileKey } = await params;
    const session = await auth();
    const user = await getCurrentUser();
    
    if (!session?.userId) {
      console.log('[API] Unauthorized access attempt - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API] Received fileKey:', fileKey);
    const parts = fileKey.split('/');
    if (parts.length !== 3) {
      console.log('[API] Invalid file key format:', fileKey);
      return NextResponse.json({ error: 'Invalid file key format' }, { status: 400 });
    }

    const userId = parts[0];
    const orderId = parts[1];
    // const testId = parts[2].split('-')[0]; // Not needed for S3

    if (user?.role === 'ADMIN') {
      const fullKey = `test-results/${fileKey}`;
      console.log('[API] User is admin. Generating signed URL for:', fullKey);
      try {
        const downloadUrl = await generateDownloadUrl(fullKey);
        console.log('[API] Signed URL generated for admin:', downloadUrl);
        return NextResponse.json({ downloadUrl });
      } catch (err) {
        console.log('[API] Error generating signed URL for admin:', err);
        return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
      }
    }

    // Non-admins: check order ownership
    console.log('[API] User is not admin. Checking order ownership for orderId:', orderId);
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order) {
      console.log('[API] Order not found in DB for orderId:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.patientId !== session.userId) {
      console.log('[API] User is not the patient. patientId:', order.patientId, 'userId:', session.userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullKey = `test-results/${fileKey}`;
    console.log('[API] User is patient. Generating signed URL for:', fullKey);
    try {
      const downloadUrl = await generateDownloadUrl(fullKey);
      console.log('[API] Signed URL generated for patient:', downloadUrl);
      return NextResponse.json({ downloadUrl });
    } catch (err) {
      console.log('[API] Error generating signed URL for patient:', err);
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
  } catch (error) {
    console.log('[API] Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 