import crypto from 'crypto';

interface ZoomSignatureParams {
  meetingNumber: string;
  role: number;
}

export const generateZoomSignature = ({ meetingNumber, role }: ZoomSignatureParams): string => {
  const apiKey = process.env.ZOOM_API_KEY;
  const apiSecret = process.env.ZOOM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Zoom API credentials are not configured');
  }

  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64');
  const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64');
  const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');

  return signature;
}; 