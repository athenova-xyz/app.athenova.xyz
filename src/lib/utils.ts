import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue } from 'clsx';

/**
 * A utility function for conditionally joining CSS class names together.
 * It uses `clsx` to handle various input types and `tailwind-merge` to resolve
 * Tailwind CSS conflicts by merging conflicting classes.
 *
 * @param inputs - An array of class values, which can be strings, objects,
 *                 arrays, or `undefined`/`null` values. Falsy values are ignored.
 * @returns A single string containing the merged and de-conflicted CSS class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
