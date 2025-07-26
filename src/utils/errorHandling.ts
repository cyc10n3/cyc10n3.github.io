import type { ErrorState } from '@/types';

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

/**
 * Creates a standardized error object
 */
export const createError = (
  message: string,
  code: string = 'UNKNOWN_ERROR',
  status: number = 500,
  details?: Record<string, any>
): APIError => ({
  message,
  code,
  status,
  details,
});

/**
 * Handles API errors and returns user-friendly messages
 */
export const handleAPIError = (error: any): ErrorState => {
  // Network errors
  if (!navigator.onLine) {
    return {
      hasError: true,
      message: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_ERROR',
    };
  }

  // Fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      hasError: true,
      message: 'Unable to connect to the server. Please try again later.',
      code: 'CONNECTION_ERROR',
    };
  }

  // API response errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          hasError: true,
          message: error.message || 'Invalid request. Please check your input and try again.',
          code: 'BAD_REQUEST',
        };
      case 401:
        return {
          hasError: true,
          message: 'Authentication required. Please log in and try again.',
          code: 'UNAUTHORIZED',
        };
      case 403:
        return {
          hasError: true,
          message: 'Access denied. You do not have permission to perform this action.',
          code: 'FORBIDDEN',
        };
      case 404:
        return {
          hasError: true,
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
        };
      case 429:
        return {
          hasError: true,
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMITED',
        };
      case 500:
        return {
          hasError: true,
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
        };
      default:
        return {
          hasError: true,
          message: error.message || 'An unexpected error occurred. Please try again.',
          code: 'UNKNOWN_ERROR',
        };
    }
  }

  // Generic errors
  return {
    hasError: true,
    message: error.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
};

/**
 * Logs errors for monitoring (in production, this would send to a service like Sentry)
 */
export const logError = (error: Error | APIError, context?: Record<string, any>) => {
  const errorData = {
    message: error.message,
    stack: 'stack' in error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, or other monitoring service
    // Sentry.captureException(error, { extra: errorData });
  }
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Handles form submission errors
 */
export const handleFormError = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validation errors from server
  if (error.details && typeof error.details === 'object') {
    Object.keys(error.details).forEach(field => {
      errors[field] = error.details[field];
    });
  } else {
    // Generic error
    errors.general = error.message || 'An error occurred while submitting the form.';
  }

  return errors;
};

/**
 * Checks if an error is recoverable (user can retry)
 */
export const isRecoverableError = (error: APIError): boolean => {
  const recoverableCodes = [
    'NETWORK_ERROR',
    'CONNECTION_ERROR',
    'SERVER_ERROR',
    'RATE_LIMITED',
  ];
  
  return recoverableCodes.includes(error.code);
};

/**
 * Gets user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: APIError): string => {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Please check your internet connection and try again.',
    CONNECTION_ERROR: 'Unable to connect to our servers. Please try again later.',
    SERVER_ERROR: 'Our servers are experiencing issues. Please try again in a few minutes.',
    RATE_LIMITED: 'You\'re making requests too quickly. Please wait a moment and try again.',
    VALIDATION_ERROR: 'Please check your input and correct any errors.',
    NOT_FOUND: 'The requested information could not be found.',
    UNAUTHORIZED: 'Please refresh the page and try again.',
    FORBIDDEN: 'You don\'t have permission to perform this action.',
  };

  return messages[error.code] || error.message || 'An unexpected error occurred.';
};