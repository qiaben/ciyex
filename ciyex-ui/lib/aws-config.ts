import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Bucket name
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Generate a signed URL for uploading
export async function generateUploadUrl(key: string) {
  console.log('Generating upload URL for key:', key);
  console.log('Using bucket:', BUCKET_NAME);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: 'application/pdf',
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    console.log('Generated upload URL:', url);
    return url;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw error;
  }
}

// Generate a signed URL for downloading/viewing
export async function generateDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentType: 'application/pdf', // force PDF content type
  });
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
}

// Generate a unique key for the file
export function generateFileKey(orderId: string, testId: string, userId: string) {
  const timestamp = Date.now();
  const key = `test-results/${userId}/${orderId}/${testId}-${timestamp}.pdf`;
  console.log('Generated file key:', key);
  return key;
} 