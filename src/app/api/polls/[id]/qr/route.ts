import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generatePollUrl, generateQrDataUrl, generateQrSvg } from '@/lib/qr/generate';
import { createSignedPollUrl } from '@/lib/qr/server';

// Logging utility
function logError(context: string, error: unknown, metadata?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: errorMessage,
    ...metadata
  };
  console.error('[QR API Error]', JSON.stringify(logData));
}

function logInfo(context: string, metadata?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    ...metadata
  };
  console.log('[QR API Info]', JSON.stringify(logData));
}

// Security utilities
function validateHost(host: string): string {
  const allowedHosts = [
    'localhost:3000',
    'localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, ''),
    process.env.VERCEL_URL,
  ].filter(Boolean);
  
  // Remove protocol if present
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  if (allowedHosts.includes(cleanHost)) {
    return cleanHost;
  }
  
  // Fallback to environment variable or localhost
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
}

function validatePollId(pollId: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(pollId);
}

// Shared utility functions
async function fetchPollData(pollId: string): Promise<PollData | null> {
  const supabase = createServiceClient();
  const { data: poll, error } = await supabase
    .from('polls')
    .select('id, title, is_private, created_at')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    return null;
  }

  return poll as PollData;
}

async function generateQrForPoll(
  pollId: string, 
  pollData: PollData, 
  validatedHost: string, 
  expiresInSeconds: number = 86400
): Promise<QrResponse> {
  // Generate appropriate URL based on poll visibility
  let pollUrl: string;
  
  if (pollData.is_private) {
    // For private polls, create a signed URL
    pollUrl = await createSignedPollUrl(pollId, { expiresInSeconds });
  } else {
    // For public polls, use validated host
    pollUrl = generatePollUrl(pollId, { host: validatedHost });
  }

  // Generate QR codes
  const [dataUrl, svg] = await Promise.all([
    generateQrDataUrl(pollUrl),
    generateQrSvg(pollUrl)
  ]);

  return { dataUrl, svg };
}

interface QrResponse {
  dataUrl: string;
  svg: string;
}

interface PollData {
  id: string;
  title: string;
  is_private: boolean;
  created_at: string;
}

// LRU Cache implementation for QR codes
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache configuration
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 1000; // Maximum number of cached QR codes
const qrCache = new LRUCache<string, { data: QrResponse; timestamp: number }>(MAX_CACHE_SIZE);

// Cache cleanup interval (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  // Note: We can't iterate over LRU cache directly, so we'll implement a cleanup method
  // For now, we'll rely on the LRU eviction and periodic full cleanup
}, 30 * 60 * 1000);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const pollId = params.id;
    
    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    // Validate poll ID format
    if (!validatePollId(pollId)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    // Validate and sanitize host
    const rawHost = request.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
    const validatedHost = validateHost(rawHost);

    // Check cache first (include host in cache key)
    const cacheKey = `qr-${pollId}-${validatedHost}`;
    const cached = qrCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logInfo('QR code served from cache', { 
        pollId, 
        method: 'GET',
        cacheHit: true 
      });
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'Content-Type': 'application/json'
        }
      });
    }

    // Fetch poll data
    const pollData = await fetchPollData(pollId);
    if (!pollData) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Generate QR codes using shared logic
    const response = await generateQrForPoll(pollId, pollData, validatedHost);

    // Cache the result
    qrCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    logInfo('QR code generated successfully', { 
      pollId, 
      method: 'GET',
      isPrivate: pollData.is_private,
      cacheHit: false 
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    logError('GET /api/polls/[id]/qr', error, { pollId: params.id });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const pollId = params.id;
    
    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    // Validate poll ID format
    if (!validatePollId(pollId)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { 
      regenerate = false, 
      expiresInSeconds = 86400,
      host 
    } = body;

    // Validate and sanitize host
    const rawHost = host || request.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
    const validatedHost = validateHost(rawHost);

    // Fetch poll data
    const pollData = await fetchPollData(pollId);
    if (!pollData) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    const cacheKey = `qr-${pollId}-${validatedHost}`;

    // If regenerate is requested, clear cache
    if (regenerate) {
      qrCache.delete(cacheKey);
    }

    // Check cache unless regeneration is requested
    if (!regenerate) {
      const cached = qrCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        logInfo('QR code served from cache', { 
          pollId, 
          method: 'POST',
          cacheHit: true 
        });
        return NextResponse.json(cached.data, {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=3600',
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Generate QR codes using shared logic
    const response = await generateQrForPoll(pollId, pollData, validatedHost, expiresInSeconds);

    // Cache the result
    qrCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    logInfo('QR code generated successfully', { 
      pollId, 
      method: 'POST',
      isPrivate: pollData.is_private,
      regenerate,
      expiresInSeconds,
      cacheHit: false 
    });

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    logError('POST /api/polls/[id]/qr', error, { pollId: params.id });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}