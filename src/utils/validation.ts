import type { ValidationResult, ContactFormData, ContactFormErrors } from '@/types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Phone is optional
  return PHONE_REGEX.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return undefined;
};

/**
 * Validates minimum length
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | undefined => {
  if (value && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return undefined;
};

/**
 * Validates maximum length
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | undefined => {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return undefined;
};

/**
 * Validates contact form data
 */
export const validateContactForm = (data: ContactFormData): ValidationResult => {
  const errors: ContactFormErrors = {};

  // First Name validation
  const firstNameError = validateRequired(data.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;

  // Last Name validation
  const lastNameError = validateRequired(data.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;

  // Email validation
  const emailRequiredError = validateRequired(data.email, 'Email');
  if (emailRequiredError) {
    errors.email = emailRequiredError;
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Subject validation
  const subjectError = validateRequired(data.subject, 'Subject');
  if (subjectError) errors.subject = subjectError;

  // Message validation
  const messageRequiredError = validateRequired(data.message, 'Message');
  if (messageRequiredError) {
    errors.message = messageRequiredError;
  } else {
    const messageMinLengthError = validateMinLength(data.message, 10, 'Message');
    if (messageMinLengthError) errors.message = messageMinLengthError;
    
    const messageMaxLengthError = validateMaxLength(data.message, 1000, 'Message');
    if (messageMaxLengthError) errors.message = messageMaxLengthError;
  }

  // Company name validation (optional but with length limits)
  if (data.company) {
    const companyMaxLengthError = validateMaxLength(data.company, 100, 'Company name');
    if (companyMaxLengthError) errors.company = companyMaxLengthError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors as Record<string, string>,
  };
};

/**
 * Validates file upload
 */
export const validateFileUpload = (
  file: File,
  allowedTypes: string[],
  maxSizeInMB: number
): string | undefined => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return `File size too large. Maximum size: ${maxSizeInMB}MB`;
  }

  return undefined;
};

/**
 * Validates search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (query.trim().length < 2) {
    errors.query = 'Search query must be at least 2 characters long';
  }

  if (query.trim().length > 100) {
    errors.query = 'Search query must be no more than 100 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitizes HTML input to prevent XSS
 */
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validates and sanitizes form input
 */
export const sanitizeFormInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates date format and range
 */
export const validateDate = (
  date: string,
  minDate?: Date,
  maxDate?: Date
): string | undefined => {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return 'Please enter a valid date';
  }

  if (minDate && parsedDate < minDate) {
    return `Date must be after ${minDate.toLocaleDateString()}`;
  }

  if (maxDate && parsedDate > maxDate) {
    return `Date must be before ${maxDate.toLocaleDateString()}`;
  }

  return undefined;
};