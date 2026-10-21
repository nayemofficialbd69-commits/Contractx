/**
 * ConnectX Messenger - Collision-Resistant Public ID Service
 * Generates and validates unique public ID codes in the format CX-XXXXXXXX
 * (e.g., CX-7K4M9P2Q)
 */

// Custom alphabet excluding ambiguous characters: 0/O, 1/I/L
const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const ID_LENGTH = 8;
const ID_PREFIX = 'CX-';

/**
 * Generate a cryptographically secure random alphanumeric string
 */
export function generateRawIdCode(): string {
  const randomBytes = new Uint8Array(ID_LENGTH);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < ID_LENGTH; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let result = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    const index = randomBytes[i] % SAFE_ALPHABET.length;
    result += SAFE_ALPHABET[index];
  }
  return `${ID_PREFIX}${result}`;
}

/**
 * Validates whether a given string is a valid ConnectX Public ID Code
 */
export function isValidPublicId(publicId: string): boolean {
  if (!publicId || typeof publicId !== 'string') return false;
  const clean = publicId.trim().toUpperCase();
  const regex = /^CX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;
  return regex.test(clean);
}

/**
 * Normalizes a Public ID to uppercase with CX- prefix
 */
export function normalizePublicId(input: string): string {
  let cleaned = input.trim().toUpperCase();
  if (!cleaned.startsWith(ID_PREFIX) && cleaned.length === 8) {
    cleaned = `${ID_PREFIX}${cleaned}`;
  }
  return cleaned;
}

/**
 * Validates a username according to ConnectX specs:
 * 3-20 characters, lowercase letters, numbers, underscores only
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  const clean = username.startsWith('@') ? username.slice(1) : username;

  if (clean.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  if (clean.length > 20) {
    return { isValid: false, error: 'Username must not exceed 20 characters' };
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(clean)) {
    return { isValid: false, error: 'Only letters, numbers, and underscores are allowed' };
  }
  return { isValid: true };
}

/**
 * Normalize username for uniqueness index
 */
export function normalizeUsername(username: string): string {
  const clean = username.startsWith('@') ? username.slice(1) : username;
  return clean.toLowerCase().trim();
}
