import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { generateDownloadUrl } from '@/lib/aws-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileKey: string[] }> }
) {
  try {
    const { fileKey: parts } = await params;

    if (parts.length !== 3) {
      console.log('[API] Invalid file key format:', parts);
      return NextResponse.json({ error: 'Invalid file key format' }, { status: 400 });
    }

    const fullPath = parts.join('/');
    const { userId } = getAuth(request);
    if (!userId) {
      console.log('[API] Unauthorized access attempt - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Clerk user to get role from public metadata
    let userRole = 'PATIENT';
    try {
      const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const userData = await res.json();
        userRole = userData.public_metadata?.role?.toUpperCase() || 'PATIENT';
      }
    } catch (err) {
      console.log('[API] Could not fetch Clerk user metadata:', err);
    }

    const orderId = parts[1];

    // Permission check
    if (userRole !== 'ADMIN') {
      console.log('[API] User is not admin. Checking order ownership for orderId:', orderId);
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });
      if (!order) {
        console.log('[API] Order not found in DB for orderId:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      if (order.patientId !== userId) {
        console.log('[API] User is not the patient. patientId:', order.patientId, 'userId:', userId);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Proxy the file from S3
    const s3Key = `test-results/${fullPath}`;
    console.log('[API] Proxying file for:', s3Key);
    try {
      const downloadUrl = await generateDownloadUrl(s3Key);
      const s3Res = await fetch(downloadUrl);
      if (!s3Res.ok) {
        console.log('[API] S3 returned error:', s3Res.status);
        return NextResponse.json({ error: 'Failed to fetch file from S3' }, { status: 500 });
      }
      // Stream the PDF file to the client
      const headers = new Headers(s3Res.headers);
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', 'inline; filename="result.pdf"');
      return new NextResponse(s3Res.body, {
        status: 200,
        headers,
      });
    } catch (err) {
      console.log('[API] Error proxying file from S3:', err);
      return NextResponse.json({ error: 'Failed to proxy file' }, { status: 500 });
    }
  } catch (error) {
    console.log('[API] Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 