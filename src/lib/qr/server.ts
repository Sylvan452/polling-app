import { createHmac } from 'crypto';

// Types
interface CreateSignedPollUrlOptions {
  expiresInSeconds: number;
}

interface SignedUrlPayload {
  pollId: string;
  expires: number;
}

/**
 * Creates a signed poll URL with expiration using HMAC
 * SERVER-ONLY: This function should only be used on the server side
 * @param pollId - The poll identifier
 * @param options - Configuration options including expiration time
 * @returns Promise resolving to the signed poll URL
 */
export async function createSignedPollUrl(
  pollId: string,
  options: CreateSignedPollUrlOptions
): Promise<string> {
  const { expiresInSeconds } = options;
  const signingKey = process.env.QR_SIGNING_KEY;
  
  if (!signingKey) {
    throw new Error('QR_SIGNING_KEY environment variable is required for signed URLs');
  }

  const expires = Date.now() + (expiresInSeconds * 1000);
  const payload: SignedUrlPayload = {
    pollId,
    expires
  };

  const payloadString = JSON.stringify(payload);
  const signature = createHmac('sha256', signingKey)
    .update(payloadString)
    .digest('hex');

  const encodedPayload = Buffer.from(payloadString).toString('base64url');
  const host = process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
  const baseUrl = host.startsWith('http') ? host : `https://${host}`;
  
  return `${baseUrl}/polls/${pollId}?token=${encodedPayload}&signature=${signature}`;
}

/**
 * Utility function to verify a signed poll URL
 * SERVER-ONLY: This function should only be used on the server side
 * @param token - The base64url encoded payload
 * @param signature - The HMAC signature
 * @returns The decoded payload if valid, null if invalid or expired
 */
export function verifySignedPollUrl(
  token: string,
  signature: string
): SignedUrlPayload | null {
  try {
    const signingKey = process.env.QR_SIGNING_KEY;
    
    if (!signingKey) {
      return null;
    }

    const payloadString = Buffer.from(token, 'base64url').toString('utf-8');
    const expectedSignature = createHmac('sha256', signingKey)
      .update(payloadString)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (signature !== expectedSignature) {
      return null;
    }

    const payload: SignedUrlPayload = JSON.parse(payloadString);
    
    // Check if the URL has expired
    if (Date.now() > payload.expires) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export type { SignedUrlPayload, CreateSignedPollUrlOptions };