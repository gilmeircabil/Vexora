import { Result, ok, err } from '../result.js';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous?: boolean; // exclude 0, O, l, 1, I
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', 'l', '1', 'I']);

export function calculatePasswordEntropy(length: number, poolSize: number): number {
  if (length <= 0 || poolSize <= 0) return 0;
  return Math.round(length * Math.log2(poolSize));
}

/**
 * Generates a cryptographically strong password using crypto.getRandomValues.
 */
export function generatePassword(
  options: PasswordOptions,
): Result<{ password: string; entropyBits: number; poolSize: number }, string> {
  const { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous } = options;

  if (length < 4 || length > 128) {
    return err('Password length must be between 4 and 128 characters.');
  }

  let pool = '';
  const requiredSets: string[] = [];

  const filterPool = (chars: string) =>
    excludeAmbiguous
      ? chars
          .split('')
          .filter((c) => !AMBIGUOUS_CHARS.has(c))
          .join('')
      : chars;

  if (uppercase) {
    const s = filterPool(UPPERCASE_CHARS);
    if (s) {
      pool += s;
      requiredSets.push(s);
    }
  }
  if (lowercase) {
    const s = filterPool(LOWERCASE_CHARS);
    if (s) {
      pool += s;
      requiredSets.push(s);
    }
  }
  if (numbers) {
    const s = filterPool(NUMBER_CHARS);
    if (s) {
      pool += s;
      requiredSets.push(s);
    }
  }
  if (symbols) {
    const s = filterPool(SYMBOL_CHARS);
    if (s) {
      pool += s;
      requiredSets.push(s);
    }
  }

  if (pool.length === 0) {
    return err('At least one character type must be selected.');
  }

  if (requiredSets.length > length) {
    return err(`Length of ${length} is too short to include one of each selected character set.`);
  }

  // Cryptographically secure random selection
  const randomBytes = new Uint32Array(length + requiredSets.length);
  crypto.getRandomValues(randomBytes);

  const passwordChars: string[] = [];
  let byteIndex = 0;

  // Guarantee at least one character from each enabled set
  for (const set of requiredSets) {
    const char = set[randomBytes[byteIndex++]! % set.length]!;
    passwordChars.push(char);
  }

  // Fill remaining characters from the entire pool
  while (passwordChars.length < length) {
    const char = pool[randomBytes[byteIndex++]! % pool.length]!;
    passwordChars.push(char);
  }

  // Shuffle the password array using Fisher-Yates with crypto random values
  const shuffleBytes = new Uint32Array(passwordChars.length);
  crypto.getRandomValues(shuffleBytes);
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = shuffleBytes[i]! % (i + 1);
    const temp = passwordChars[i]!;
    passwordChars[i] = passwordChars[j]!;
    passwordChars[j] = temp;
  }

  const password = passwordChars.join('');
  const entropyBits = calculatePasswordEntropy(length, pool.length);

  return ok({
    password,
    entropyBits,
    poolSize: pool.length,
  });
}
