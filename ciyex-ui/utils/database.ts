import { prisma } from '@/lib/prisma';

/**
 * Database connection utility with error handling
 */
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // Handle specific connection errors
    if (error instanceof Error) {
      if (error.message.includes('remaining connection slots are reserved')) {
        return { 
          success: false, 
          error: 'Database connection limit reached. Please try again later.' 
        };
      }
      if (error.message.includes('connection')) {
        return { 
          success: false, 
          error: 'Database connection error. Please try again.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'An unexpected database error occurred.' 
    };
  }
}

/**
 * Close database connection (useful for cleanup)
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
} 