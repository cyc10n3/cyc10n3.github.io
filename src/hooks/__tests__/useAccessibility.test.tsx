// Tests for accessibility hooks
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '../../test-utils';
import {
  useFocusTrap,
  useScreenReader,
  useKeyboardNavigation,
  useAccessibilityPreferences,
  useAriaAttributes,
  useLiveRegion,
  useSkipLinks
} from '../useAccessibility';

// Mock the accessibility utilities
jest.mock('../../utils/accessibility', () => ({
  trapFocus: jest.fn(() => jest.fn()),
  announceToScreenReader: jest.fn(),
  handleArrowKeyNavigation: jest.fn((items, currentIndex, key) => {
    if (key === 'ArrowRight') return Math.min(currentIndex + 1, items.length - 1);
    if (key === 'ArrowLeft') return Math.max(currentIndex - 1, 0);
    return currentIndex;
  }),
  prefersReducedMotion: jest.fn(() => false),
  prefersHighContrast: jest.fn(() => false)
}));

describe('useFocusTrap', () => {
  it('activates focus trap when isActive is true', () => {
    const { trapFocus } = require('../../utils/accessibility');
    const mockCleanup = jest.fn();
    trapFocus.mockReturnValue(mockCleanup);

    const TestComponent = () => {
      const containerRef = useFocusTrap(true);
      return <div ref={containerRef}>Content</div>;
    };

    render(<TestComponent />);

    expect(trapFocus).toHaveBeenCalled();
  });

  it('deactivates focus trap when isActive is false', () => {
    const { trapFocus } = require('../../utils/accessibility');
    const mockCleanup = jest.fn();
    trapFocus.mockReturnValue(mockCleanup);

    const TestComponent = ({ isActive }: { isActive: boolean }) => {
      const containerRef = useFocusTrap(isActive);
      return <div ref={containerRef}>Content</div>;
    };

    const { rerender } = render(<TestComponent isActive={true} />);
    expect(trapFocus).toHaveBeenCalled();

    rerender(<TestComponent isActive={false} />);
    expect(mockCleanup).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const { trapFocus } = require('../../utils/accessibility');
    const mockCleanup = jest.fn();
    trapFocus.mockReturnValue(mockCleanup);

    const TestComponent = () => {
      const containerRef = useFocusTrap(true);
      return <div ref={containerRef}>Content</div>;
    };

    const { unmount } = render(<TestComponent />);
    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });
});

describe('useScreenReader', () => {
  it('provides announce function', () => {
    const { announceToScreenReader } = require('../../utils/accessibility');
    
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message', 'assertive');
    });

    expect(announceToScreenReader).toHaveBeenCalledWith('Test message', 'assertive');
  });

  it('defaults to polite priority', () => {
    const { announceToScreenReader } = require('../../utils/accessibility');
    
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message');
    });

    expect(announceToScreenReader).toHaveBeenCalledWith('Test message', 'polite');
  });
});

describe('useKeyboardNavigation', () => {
  let mockItems: HTMLElement[];

  beforeEach(() => {
    mockItems = [
      { addEventListener: jest.fn(), removeEventListener: jest.fn() } as any,
      { addEventListener: jest.fn(), removeEventListener: jest.fn() } as any,
      { addEventListener: jest.fn(), removeEventListener: jest.fn() } as any
    ];
  });

  it('initializes with currentIndex 0', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, 'horizontal')
    );

    expect(result.current.currentIndex).toBe(0);
  });

  it('provides setCurrentIndex function', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, 'horizontal')
    );

    act(() => {
      result.current.setCurrentIndex(2);
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('adds event listeners to current item', () => {
    renderHook(() => useKeyboardNavigation(mockItems, 'horizontal'));

    expect(mockItems[0].addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes event listeners on cleanup', () => {
    const { unmount } = renderHook(() => useKeyboardNavigation(mockItems, 'horizontal'));

    unmount();

    expect(mockItems[0].removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('useAccessibilityPreferences', () => {
  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    });
  });

  it('initializes with default preferences', () => {
    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.highContrast).toBe(false);
  });

  it('updates preferences based on media queries', () => {
    const mockMatchMedia = jest.fn(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));
    Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia });

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.highContrast).toBe(true);
  });

  it('adds event listeners for preference changes', () => {
    const mockAddEventListener = jest.fn();
    const mockMatchMedia = jest.fn(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn()
    }));
    Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia });

    renderHook(() => useAccessibilityPreferences());

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useAriaAttributes', () => {
  it('initializes with provided attributes', () => {
    const initialAttributes = { 'aria-label': 'Test label' };
    const { result } = renderHook(() => useAriaAttributes(initialAttributes));

    expect(result.current.attributes).toEqual(initialAttributes);
  });

  it('updates attributes', () => {
    const { result } = renderHook(() => useAriaAttributes());

    act(() => {
      result.current.updateAttribute('aria-expanded', true);
    });

    expect(result.current.attributes).toEqual({ 'aria-expanded': true });
  });

  it('removes attributes', () => {
    const initialAttributes = { 'aria-label': 'Test', 'aria-expanded': true };
    const { result } = renderHook(() => useAriaAttributes(initialAttributes));

    act(() => {
      result.current.removeAttribute('aria-expanded');
    });

    expect(result.current.attributes).toEqual({ 'aria-label': 'Test' });
  });

  it('preserves other attributes when updating', () => {
    const { result } = renderHook(() => useAriaAttributes({ 'aria-label': 'Test' }));

    act(() => {
      result.current.updateAttribute('aria-expanded', true);
    });

    expect(result.current.attributes).toEqual({
      'aria-label': 'Test',
      'aria-expanded': true
    });
  });
});

describe('useLiveRegion', () => {
  it('initializes with empty message', () => {
    const { result } = renderHook(() => useLiveRegion());

    expect(result.current.message).toBe('');
    expect(result.current.priority).toBe('polite');
  });

  it('updates message and priority', () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message', 'assertive');
    });

    expect(result.current.message).toBe('Test message');
    expect(result.current.priority).toBe('assertive');
  });

  it('defaults to polite priority', () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.priority).toBe('polite');
  });

  it('clears message after timeout', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.message).toBe('Test message');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.message).toBe('');

    jest.useRealTimers();
  });
});

describe('useSkipLinks', () => {
  it('provides skip link management functions', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(typeof result.current.addSkipLink).toBe('function');
    expect(typeof result.current.removeSkipLink).toBe('function');
    expect(typeof result.current.focusSkipTarget).toBe('function');
  });

  it('adds skip links to collection', () => {
    const { result } = renderHook(() => useSkipLinks());
    const mockElement = document.createElement('a');

    act(() => {
      result.current.addSkipLink(mockElement);
    });

    // Since we can't directly access the ref, we test the function doesn't throw
    expect(() => result.current.addSkipLink(mockElement)).not.toThrow();
  });

  it('focuses skip target element', () => {
    const { result } = renderHook(() => useSkipLinks());
    const mockElement = document.createElement('div');
    mockElement.id = 'test-target';
    mockElement.focus = jest.fn();
    mockElement.scrollIntoView = jest.fn();
    document.body.appendChild(mockElement);

    act(() => {
      result.current.focusSkipTarget('test-target');
    });

    expect(mockElement.focus).toHaveBeenCalled();
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(mockElement);
  });

  it('handles missing skip target gracefully', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(() => {
      act(() => {
        result.current.focusSkipTarget('non-existent-target');
      });
    }).not.toThrow();
  });
});