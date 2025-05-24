import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugService {
  /**
   * Creates a URL-friendly slug from a given string
   * @param text - The text to convert to a slug
   * @returns A URL-friendly slug
   */
  createSlug(text: string): string {
    if (!text) return '';

    return text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove special characters except hyphens
      .replace(/[^\w\-]+/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove hyphens from start and end
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Creates a slug and ensures it doesn't exceed the maximum length
   * @param text - The text to convert to a slug
   * @param maxLength - Maximum length of the slug (default: 100)
   * @returns A URL-friendly slug with length constraints
   */
  createSlugWithLimit(text: string, maxLength = 100): string {
    const slug = this.createSlug(text);
    
    if (slug.length <= maxLength) {
      return slug;
    }

    // Truncate at the last hyphen before maxLength to avoid breaking words
    const truncated = slug.substring(0, maxLength);
    const lastHyphenIndex = truncated.lastIndexOf('-');
    
    return lastHyphenIndex > 0 ? truncated.substring(0, lastHyphenIndex) : truncated;
  }

  /**
   * Validates if a string is a valid slug format
   * @param slug - The slug to validate
   * @returns True if the slug is valid, false otherwise
   */
  isValidSlug(slug: string): boolean {
    if (!slug) return false;
    
    // Check if slug contains only lowercase letters, numbers, and hyphens
    // Must not start or end with hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Sanitizes a slug to ensure it meets format requirements
   * @param slug - The slug to sanitize
   * @returns A sanitized slug
   */
  sanitizeSlug(slug: string): string {
    return this.createSlug(slug);
  }
}