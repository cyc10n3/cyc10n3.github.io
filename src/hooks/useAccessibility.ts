// React hooks for accessibility features
import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  announceToScreenReader, 
  trapFocus, 
  prefersReducedMotion, 
  prefersHighContrast,
  handleArrowKeyNavigation 
} from '../utils/accessibility';

// Hook for managing focus trap
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current);
    } else if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return { announce };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const newIndex = handleArrowKeyNavigation(items, currentIndex, event.key, orientation);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [items, currentIndex, orientation]);

  useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem) {
      currentItem.addEventListener('keydown', handleKeyDown);
      return () => currentItem.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentIndex, items, handleKeyDown]);

  return { currentIndex, setCurrentIndex };
};

// Hook for accessibility preferences
export const useAccessibilityPreferences = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    setHighContrast(prefersHighContrast());

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return { reducedMotion, highContrast };
};

// Hook for managing ARIA attributes
export const useAriaAttributes = (initialAttributes: Record<string, any> = {}) => {
  const [attributes, setAttributes] = useState(initialAttributes);

  const updateAttribute = useCallback((key: string, value: any) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeAttribute = useCallback((key: string) => {
    setAttributes(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return { attributes, updateAttribute, removeAttribute };
};

// Hook for live region announcements
export const useLiveRegion = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
    setMessage(newMessage);
    setPriority(newPriority);
    
    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  return { message, priority, announce };
};

// Hook for skip links
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement[]>([]);

  const addSkipLink = useCallback((element: HTMLElement) => {
    skipLinksRef.current.push(element);
  }, []);

  const removeSkipLink = useCallback((element: HTMLElement) => {
    skipLinksRef.current = skipLinksRef.current.filter(el => el !== element);
  }, []);

  const focusSkipTarget = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return { addSkipLink, removeSkipLink, focusSkipTarget };
};