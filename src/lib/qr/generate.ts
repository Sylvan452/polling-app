import QRCode from 'qrcode';

// Constants
const DEFAULT_QR_OPTIONS = {
  margin: 1,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 256
};

const POLL_PATH_PREFIX = '/polls';

// Types
export interface GeneratePollUrlOptions {
  host: string;
}

export interface QrCodeOptions {
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}

// Constants for validation
const MAX_URL_LENGTH = 2048; // Maximum URL length for QR codes
const MAX_QR_URL_LENGTH = 4296; // QR code capacity limit for URLs

// Validation functions
/**
 * Validates that a string is not empty or whitespace-only
 * @param value - The string to validate
 * @param fieldName - The name of the field for error messages
 * @throws Error if validation fails
 */
function validateNonEmptyString(value: string | undefined | null, fieldName: string): void {
  if (!value?.trim()) {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
}

/**
 * Validates poll URL generation parameters
 * @param pollId - The poll identifier
 * @param options - Configuration options
 * @throws Error if validation fails
 */
function validatePollUrlParams(pollId: string, options: GeneratePollUrlOptions): void {
  validateNonEmptyString(pollId, 'Poll ID');
  validateNonEmptyString(options?.host, 'Host');
}

/**
 * Validates QR code generation parameters
 * @param url - The URL to encode
 * @throws Error if validation fails
 */
function validateQrParams(url: string): void {
  validateNonEmptyString(url, 'URL');
  
  // Check URL length to prevent DoS attacks
  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL length exceeds maximum allowed length of ${MAX_URL_LENGTH} characters`);
  }
  
  // Check QR code capacity limit
  if (url.length > MAX_QR_URL_LENGTH) {
    throw new Error(`URL too long for QR code generation (max ${MAX_QR_URL_LENGTH} characters)`);
  }
  
  // Basic URL format validation
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }
}

// Utility functions
/**
 * Normalizes a host URL by ensuring it has a protocol
 * @param host - The host string to normalize
 * @returns Normalized URL with protocol
 */
export function normalizeHost(host: string): string {
  return host.startsWith('http') ? host : `https://${host}`;
}

/**
 * Creates a standardized error message for QR code generation failures
 * @param operation - The operation that failed
 * @param error - The original error
 * @returns Formatted error message
 */
export function createQrError(operation: string, error: unknown): Error {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new Error(`Failed to generate QR code ${operation}: ${message}`);
}

/**
 * Merges user options with default QR code options
 * @param userOptions - User-provided options
 * @returns Merged options object
 */
export function mergeQrOptions(userOptions: QrCodeOptions = {}) {
  return {
    ...DEFAULT_QR_OPTIONS,
    ...userOptions,
    color: {
      ...DEFAULT_QR_OPTIONS.color,
      ...userOptions.color
    }
  };
}

/**
 * Constructs a poll URL from components
 * @param baseUrl - The normalized base URL
 * @param pollId - The poll identifier
 * @returns Complete poll URL
 */
export function constructPollUrl(baseUrl: string, pollId: string): string {
  return `${baseUrl}${POLL_PATH_PREFIX}/${pollId}`;
}

// Main functions
/**
 * Generates a poll URL with the given host
 * @param pollId - The poll identifier
 * @param options - Configuration options including host
 * @returns The complete poll URL
 */
export function generatePollUrl(pollId: string, options: GeneratePollUrlOptions): string {
  validatePollUrlParams(pollId, options);
  
  const baseUrl = normalizeHost(options.host);
  return constructPollUrl(baseUrl, pollId);
}

/**
 * Generates a QR code as a PNG data URL
 * @param url - The URL to encode in the QR code
 * @param options - Optional QR code styling options
 * @returns Promise resolving to a data URL string (PNG format)
 */
export async function generateQrDataUrl(
  url: string, 
  options: QrCodeOptions = {}
): Promise<string> {
  validateQrParams(url);

  try {
    const qrOptions = mergeQrOptions(options);
    const dataUrl = await QRCode.toDataURL(url, qrOptions);
    return dataUrl;
  } catch (error) {
    throw createQrError('data URL', error);
  }
}

/**
 * Generates a QR code as an SVG string
 * @param url - The URL to encode in the QR code
 * @param options - Optional QR code styling options
 * @returns Promise resolving to an SVG string
 */
export async function generateQrSvg(
  url: string, 
  options: QrCodeOptions = {}
): Promise<string> {
  validateQrParams(url);

  try {
    const qrOptions = {
      ...mergeQrOptions(options),
      type: 'svg' as const
    };
    const svgString = await QRCode.toString(url, qrOptions);
    return svgString;
  } catch (error) {
    throw createQrError('SVG', error);
  }
}

// Export constants for testing
export const QR_CONSTANTS = {
  DEFAULT_QR_OPTIONS,
  POLL_PATH_PREFIX
} as const;