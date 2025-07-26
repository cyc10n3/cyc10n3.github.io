/**
 * Fallback utilities for handling missing or broken content
 */

/**
 * Fallback image URL for broken images
 */
export const FALLBACK_IMAGE = '/assets/images/placeholder.webp';

/**
 * Fallback company logo
 */
export const FALLBACK_LOGO = '/assets/images/logo-fallback.svg';

/**
 * Default placeholder text for missing content
 */
export const PLACEHOLDER_TEXT = {
  title: 'Title Not Available',
  description: 'Description not available at this time.',
  name: 'Name Not Available',
  email: 'Email not available',
  phone: 'Phone not available',
  address: 'Address not available',
};

/**
 * Handles broken images by setting fallback source
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE;
    img.alt = 'Image not available';
  }
};

/**
 * Gets fallback content for missing data
 */
export const getFallbackContent = (
  content: string | undefined | null,
  fallback: string = PLACEHOLDER_TEXT.description
): string => {
  return content && content.trim() ? content : fallback;
};

/**
 * Gets fallback image with error handling
 */
export const getFallbackImage = (
  src: string | undefined | null,
  alt: string = 'Image'
): { src: string; alt: string; onError: (event: React.SyntheticEvent<HTMLImageElement>) => void } => {
  return {
    src: src || FALLBACK_IMAGE,
    alt: alt || 'Image not available',
    onError: handleImageError,
  };
};

/**
 * Validates and returns safe URL or fallback
 */
export const getSafeUrl = (url: string | undefined | null, fallback: string = '#'): string => {
  if (!url) return fallback;
  
  try {
    // Check if it's a valid URL
    if (url.startsWith('http') || url.startsWith('https')) {
      new URL(url);
      return url;
    }
    
    // Assume it's a relative path
    if (url.startsWith('/')) {
      return url;
    }
    
    // Add leading slash for relative paths
    return `/${url}`;
  } catch {
    return fallback;
  }
};

/**
 * Formats phone number with fallback
 */
export const formatPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return PLACEHOLDER_TEXT.phone;
  
  // Basic phone number formatting
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formats email with fallback
 */
export const formatEmail = (email: string | undefined | null): string => {
  if (!email) return PLACEHOLDER_TEXT.email;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : PLACEHOLDER_TEXT.email;
};

/**
 * Truncates text with ellipsis
 */
export const truncateText = (
  text: string | undefined | null,
  maxLength: number = 100,
  fallback: string = PLACEHOLDER_TEXT.description
): string => {
  const content = getFallbackContent(text, fallback);
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return `${content.slice(0, maxLength).trim()}...`;
};

/**
 * Formats date with fallback
 */
export const formatDate = (
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string => {
  if (!date) return 'Date not available';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', options);
  } catch {
    return 'Date not available';
  }
};

/**
 * Gets array with fallback for empty arrays
 */
export const getArrayWithFallback = <T>(
  array: T[] | undefined | null,
  fallback: T[] = []
): T[] => {
  return array && array.length > 0 ? array : fallback;
};

/**
 * Gets object property with fallback
 */
export const getPropertyWithFallback = <T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  fallback: T[K]
): T[K] => {
  return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;
};

/**
 * Handles missing or invalid JSON data
 */
export const parseJSONWithFallback = <T>(
  jsonString: string | undefined | null,
  fallback: T
): T => {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Creates a loading skeleton for missing content
 */
export const createLoadingSkeleton = (lines: number = 3): string => {
  // Return a simple loading message instead of JSX
  return `Loading ${lines} lines...`;
};