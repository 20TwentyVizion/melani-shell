/**
 * Browser-compatible UUID v4 generator
 * This is a standalone implementation that doesn't require the 'uuid' package
 */

/**
 * Generates a UUID v4 (random) string
 * @returns A UUID v4 string in the format 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Alias for uuidv4 to maintain compatibility with existing code
 * @returns A UUID v4 string
 */
export const generateId = uuidv4;
