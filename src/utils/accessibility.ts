// WCAG 2.1 AA compliance utilities

export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableFocusVisible: boolean;
  enableScreenReaderSupport: boolean;
  enableKeyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'high-contrast';
}

// Color contrast utilities
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAGContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
};

// Focus management utilities
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Screen reader utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard navigation utilities
export const handleArrowKeyNavigation = (
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const { key } = event;
  let newIndex = currentIndex;

  if (orientation === 'vertical') {
    if (key === 'ArrowDown') {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    }
  } else {
    if (key === 'ArrowRight') {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else if (key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    }
  }

  if (newIndex !== currentIndex) {
    event.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
};

// Skip link utilities
export const createSkipLink = (targetId: string, label: string): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.setAttribute('aria-label', label);

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return skipLink;
};

// Form accessibility utilities
export const associateFormElements = (input: HTMLElement, label: HTMLElement, error?: HTMLElement) => {
  const inputId = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${inputId}-label`;
  const errorId = error ? `${inputId}-error` : undefined;

  input.id = inputId;
  label.id = labelId;
  label.setAttribute('for', inputId);

  if (error) {
    error.id = errorId!;
    input.setAttribute('aria-describedby', errorId!);
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
  }
};

// Motion preferences
export const respectsReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const respectsHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

export const respectsColorScheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Text scaling utilities
export const supportsFontSizeAdjustment = () => {
  const testElement = document.createElement('div');
  testElement.style.fontSize = '200%';
  document.body.appendChild(testElement);
  
  const supportsZoom = testElement.offsetHeight > 0;
  document.body.removeChild(testElement);
  
  return supportsZoom;
};

// Heading structure validation
export const validateHeadingStructure = (): { isValid: boolean; issues: string[] } => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues: string[] = [];
  let isValid = true;

  // Check for h1
  const h1Count = headings.filter(h => h.tagName === 'H1').length;
  if (h1Count === 0) {
    issues.push('No H1 heading found');
    isValid = false;
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings found');
    isValid = false;
  }

  // Check heading hierarchy
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (index === 0 && level !== 1) {
      issues.push('First heading should be H1');
      isValid = false;
    }
    
    if (level > previousLevel + 1) {
      issues.push(`Heading level skipped: ${heading.tagName} after H${previousLevel}`);
      isValid = false;
    }
    
    previousLevel = level;
  });

  return { isValid, issues };
};

// Image accessibility utilities
export const validateImageAccessibility = (img: HTMLImageElement): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  let isValid = true;

  if (!img.alt && img.alt !== '') {
    issues.push('Image missing alt attribute');
    isValid = false;
  }

  if (img.alt && img.alt.length > 125) {
    issues.push('Alt text too long (should be under 125 characters)');
    isValid = false;
  }

  if (img.alt && /image|picture|photo|graphic/.test(img.alt.toLowerCase())) {
    issues.push('Alt text should not contain words like "image" or "picture"');
    isValid = false;
  }

  return { isValid, issues };
};

// Link accessibility utilities
export const validateLinkAccessibility = (link: HTMLAnchorElement): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  let isValid = true;

  const linkText = link.textContent?.trim() || '';
  const ariaLabel = link.getAttribute('aria-label');
  const title = link.getAttribute('title');

  if (!linkText && !ariaLabel) {
    issues.push('Link has no accessible text');
    isValid = false;
  }

  if (linkText && ['click here', 'read more', 'more', 'here'].includes(linkText.toLowerCase())) {
    issues.push('Link text is not descriptive');
    isValid = false;
  }

  if (link.target === '_blank' && !link.getAttribute('aria-label')?.includes('opens in new')) {
    issues.push('External link should indicate it opens in new window');
    isValid = false;
  }

  return { isValid, issues };
};

// ARIA utilities
export const validateARIAUsage = (element: HTMLElement): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  let isValid = true;

  // Check for required ARIA attributes
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const ariaDescribedBy = element.getAttribute('aria-describedby');

  if (role === 'button' && !ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
    issues.push('Button with role="button" needs accessible name');
    isValid = false;
  }

  if (role === 'img' && !ariaLabel && !ariaLabelledBy) {
    issues.push('Element with role="img" needs accessible name');
    isValid = false;
  }

  // Check for invalid ARIA combinations
  if (element.hasAttribute('aria-hidden') && element.hasAttribute('tabindex')) {
    const tabindex = element.getAttribute('tabindex');
    if (tabindex !== '-1') {
      issues.push('Elements with aria-hidden should not be focusable');
      isValid = false;
    }
  }

  return { isValid, issues };
};

// Accessibility testing utilities
export const runAccessibilityAudit = (): {
  headings: { isValid: boolean; issues: string[] };
  images: { isValid: boolean; issues: string[] };
  links: { isValid: boolean; issues: string[] };
  forms: { isValid: boolean; issues: string[] };
} => {
  const headings = validateHeadingStructure();
  
  const images = Array.from(document.querySelectorAll('img')).reduce(
    (acc, img) => {
      const result = validateImageAccessibility(img);
      acc.issues.push(...result.issues);
      acc.isValid = acc.isValid && result.isValid;
      return acc;
    },
    { isValid: true, issues: [] as string[] }
  );

  const links = Array.from(document.querySelectorAll('a')).reduce(
    (acc, link) => {
      const result = validateLinkAccessibility(link);
      acc.issues.push(...result.issues);
      acc.isValid = acc.isValid && result.isValid;
      return acc;
    },
    { isValid: true, issues: [] as string[] }
  );

  const forms = { isValid: true, issues: [] as string[] };
  // Form validation would be implemented here

  return { headings, images, links, forms };
};