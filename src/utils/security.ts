const fnvPrime = 0x01000193;
const fnvOffset = 0x811c9dc5;

const toHex = (value: number) => (value >>> 0).toString(16).padStart(8, '0');

const scramble = (input: string, seed: number) => {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, fnvPrime);
  }
  return hash >>> 0;
};

const hashSegments = (payload: string, segments = 4) => {
  const values: number[] = [];
  let seed = fnvOffset;

  for (let segment = 0; segment < segments; segment += 1) {
    seed = scramble(`${payload}:${segment}`, seed + segment * 0x9e3779b1);
    values.push(seed);
  }

  return values;
};

/**
 * Deterministically hashes a PIN with a tenant-specific salt.
 * The hash is not meant for production security but keeps demo data off plain text.
 */
export const hashPin = (pin: string, salt: string) => {
  const payload = `${pin}:${salt}`;
  return hashSegments(payload).map(toHex).join('');
};

export const verifyPinHash = (pin: string, salt: string, hash: string) => {
  return hashPin(pin, salt) === hash;
};

const numericHash = (payload: string) => {
  let hash = 0x9e3779b9;
  for (let index = 0; index < payload.length; index += 1) {
    hash = Math.imul(hash ^ payload.charCodeAt(index), 0x85ebca6b);
    hash ^= hash >>> 16;
  }
  return hash >>> 0;
};

const padCode = (value: number, digits = 6) => value.toString().padStart(digits, '0').slice(-digits);

export const deriveOneTimeCode = (secret: string, counter: number) => {
  const hash = numericHash(`${secret}:${counter}`);
  return padCode(hash % 1_000_000);
};

export const generatePreviewTotpCodes = (secret: string, count = 3) => {
  const window = Math.floor(Date.now() / 30_000);
  return Array.from({ length: count }, (_, index) => deriveOneTimeCode(secret, window + index));
};

export const verifyTotpCode = (secret: string, code: string) => {
  const trimmed = code.trim();
  if (trimmed.length !== 6) return false;
  const window = Math.floor(Date.now() / 30_000);
  for (let offset = -1; offset <= 1; offset += 1) {
    if (deriveOneTimeCode(secret, window + offset) === trimmed) {
      return true;
    }
  }
  return false;
};

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const randomValues = (count: number) => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const values = new Uint32Array(count);
    crypto.getRandomValues(values);
    return Array.from(values);
  }
  return Array.from({ length: count }, () => Math.floor(Math.random() * 0xffffffff));
};

export const generateTemporarySecret = (length = 16) => {
  return randomValues(length)
    .map((value) => base32Alphabet[value % base32Alphabet.length])
    .join('');
};

const recoveryAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRecoveryCodes = (count = 8) => {
  return Array.from({ length: count }, () => {
    const values = randomValues(5).map((value) => recoveryAlphabet[value % recoveryAlphabet.length]);
    const joined = values.join('');
    return `${joined.slice(0, 3)}-${joined.slice(3)}`.toUpperCase();
  });
};
