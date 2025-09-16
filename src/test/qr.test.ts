import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePollUrl } from '@/lib/qr/generate';
import { createSignedPollUrl, verifySignedPollUrl } from '@/lib/qr/server';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_APP_URL: 'https://example.com',
  QR_SIGNING_KEY: 'test-signing-key-for-unit-tests'
};

describe('QR Generation Functions', () => {
  beforeEach(() => {
    // Mock environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generatePollUrl', () => {
    it('should generate a valid poll URL with host', () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { host: 'localhost:3000' };
      
      const result = generatePollUrl(pollId, options);
      
      expect(result).toBe('https://localhost:3000/polls/123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle host with existing protocol', () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { host: 'https://example.com' };
      
      const result = generatePollUrl(pollId, options);
      
      expect(result).toBe('https://example.com/polls/123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle host with http protocol', () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { host: 'http://localhost:3000' };
      
      const result = generatePollUrl(pollId, options);
      
      expect(result).toBe('http://localhost:3000/polls/123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error for empty poll ID', () => {
      const options = { host: 'localhost:3000' };
      
      expect(() => generatePollUrl('', options)).toThrow('Poll ID is required and cannot be empty');
    });

    it('should throw error for whitespace-only poll ID', () => {
      const options = { host: 'localhost:3000' };
      
      expect(() => generatePollUrl('   ', options)).toThrow('Poll ID is required and cannot be empty');
    });

    it('should throw error for empty host', () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      
      expect(() => generatePollUrl(pollId, { host: '' })).toThrow('Host is required and cannot be empty');
    });

    it('should throw error for undefined host', () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      
      expect(() => generatePollUrl(pollId, { host: undefined as any })).toThrow('Host is required and cannot be empty');
    });
  });

  describe('createSignedPollUrl', () => {
    it('should create a signed URL with valid signature', async () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: 3600 };
      
      const result = await createSignedPollUrl(pollId, options);
      
      expect(result).toMatch(/^https:\/\/example\.com\/polls\/123e4567-e89b-12d3-a456-426614174000\?token=.+&signature=.+$/);
      expect(result).toContain('token=');
      expect(result).toContain('signature=');
    });

    it('should create different signatures for different poll IDs', async () => {
      const pollId1 = '123e4567-e89b-12d3-a456-426614174000';
      const pollId2 = '987fcdeb-51a2-43d1-9f6e-123456789abc';
      const options = { expiresInSeconds: 3600 };
      
      const result1 = await createSignedPollUrl(pollId1, options);
      const result2 = await createSignedPollUrl(pollId2, options);
      
      expect(result1).not.toBe(result2);
      
      // Extract signatures
      const signature1 = new URL(result1).searchParams.get('signature');
      const signature2 = new URL(result2).searchParams.get('signature');
      
      expect(signature1).not.toBe(signature2);
    });

    it('should create different signatures for different expiration times', async () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      
      const result1 = await createSignedPollUrl(pollId, { expiresInSeconds: 3600 });
      const result2 = await createSignedPollUrl(pollId, { expiresInSeconds: 7200 });
      
      expect(result1).not.toBe(result2);
      
      // Extract signatures
      const signature1 = new URL(result1).searchParams.get('signature');
      const signature2 = new URL(result2).searchParams.get('signature');
      
      expect(signature1).not.toBe(signature2);
    });

    it('should throw error when QR_SIGNING_KEY is missing', async () => {
      vi.unstubAllEnvs();
      
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: 3600 };
      
      await expect(createSignedPollUrl(pollId, options))
        .rejects
        .toThrow('QR_SIGNING_KEY environment variable is required for signed URLs');
    });

    it('should use localhost when NEXT_PUBLIC_APP_URL is not set', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('QR_SIGNING_KEY', 'test-key');
      
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: 3600 };
      
      const result = await createSignedPollUrl(pollId, options);
      
      expect(result).toMatch(/^https:\/\/localhost:3000\/polls\/.+/);
    });
  });

  describe('verifySignedPollUrl', () => {
    it('should verify a valid signed URL', async () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: 3600 };
      
      const signedUrl = await createSignedPollUrl(pollId, options);
      const url = new URL(signedUrl);
      const token = url.searchParams.get('token')!;
      const signature = url.searchParams.get('signature')!;
      
      const result = verifySignedPollUrl(token, signature);
      
      expect(result).not.toBeNull();
      expect(result?.pollId).toBe(pollId);
      expect(result?.expires).toBeGreaterThan(Date.now());
    });

    it('should reject invalid signature', async () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: 3600 };
      
      const signedUrl = await createSignedPollUrl(pollId, options);
      const url = new URL(signedUrl);
      const token = url.searchParams.get('token')!;
      const invalidSignature = 'invalid-signature';
      
      const result = verifySignedPollUrl(token, invalidSignature);
      
      expect(result).toBeNull();
    });

    it('should reject expired URLs', async () => {
      const pollId = '123e4567-e89b-12d3-a456-426614174000';
      const options = { expiresInSeconds: -1 }; // Already expired
      
      const signedUrl = await createSignedPollUrl(pollId, options);
      const url = new URL(signedUrl);
      const token = url.searchParams.get('token')!;
      const signature = url.searchParams.get('signature')!;
      
      const result = verifySignedPollUrl(token, signature);
      
      expect(result).toBeNull();
    });

    it('should reject malformed token', () => {
      const invalidToken = 'invalid-base64-token';
      const signature = 'some-signature';
      
      const result = verifySignedPollUrl(invalidToken, signature);
      
      expect(result).toBeNull();
    });

    it('should return null when signing key is missing', () => {
      vi.unstubAllEnvs();
      
      const token = 'some-token';
      const signature = 'some-signature';
      
      const result = verifySignedPollUrl(token, signature);
      
      expect(result).toBeNull();
    });
  });
});