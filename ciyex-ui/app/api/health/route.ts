import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/utils/database';

export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          message: 'Database connection failed' 
        }, 
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 