const PIN_SALT = 'mas::pin::demo';
const HASH_MULTIPLIER = 1315423911;

const toHex = (value: number) => value.toString(16).padStart(8, '0');

/**
 * Derives a deterministic hash for a numeric PIN. This is intentionally lightweight for the demo
 * environment but mimics the flow of salting and hashing credentials before persistence.
 */
export const derivePinHash = (pin: string): string => {
  const normalized = pin.replace(/\D/g, '');
  const salted = `${PIN_SALT}|${normalized}|${normalized.length}`;

  let hash = 0;
  for (let index = 0; index < salted.length; index += 1) {
    hash ^= (hash << 5) + salted.charCodeAt(index) + (hash >> 2);
  }

  hash = Math.abs(hash * HASH_MULTIPLIER);

  const hex = toHex(hash);
  const checksum = toHex(hash ^ HASH_MULTIPLIER ^ normalized.length);

  return `${hex}${checksum}`.toLowerCase();
};

export const verifyPinHash = (pin: string, expectedHash?: string | null): boolean => {
  if (!expectedHash) {
    return false;
  }

  try {
    const candidate = derivePinHash(pin);
    return candidate === expectedHash.toLowerCase();
  } catch (error) {
    console.error('Failed to verify PIN hash', error);
    return false;
  }
};

export const maskPin = (pin: string): string => pin.replace(/./g, '•');
