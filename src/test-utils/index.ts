// Test utilities for React Testing Library
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccessibilityProvider>
      {children}
    </AccessibilityProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Custom matchers for accessibility testing
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received: any) {
      if (received.violations.length === 0) {
        return {
          pass: true,
          message: () => 'Expected accessibility violations, but none were found'
        };
      }
      
      const violationMessages = received.violations.map((violation: any) => 
        `${violation.id}: ${violation.description}`
      ).join('\n');
      
      return {
        pass: false,
        message: () => `Expected no accessibility violations, but found:\n${violationMessages}`
      };
    }
  })
};

// Mock functions for testing
export const mockAnnounce = jest.fn();
export const mockFocus = jest.fn();

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  ...overrides
});

export const createMockProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  category: 'Pressure Vessels',
  description: 'Test description',
  specifications: {
    pressure: '150 PSI',
    temperature: '200°F',
    material: 'Carbon Steel'
  },
  images: ['/test-image.jpg'],
  ...overrides
});

export const createMockService = (overrides = {}) => ({
  id: '1',
  name: 'Test Service',
  category: 'Testing',
  description: 'Test service description',
  features: ['Feature 1', 'Feature 2'],
  ...overrides
});

// Accessibility testing helpers
export const getByRole = (container: HTMLElement, role: string, options?: any) => {
  return container.querySelector(`[role="${role}"]`) as HTMLElement;
};

export const getAllByRole = (container: HTMLElement, role: string) => {
  return Array.from(container.querySelectorAll(`[role="${role}"]`)) as HTMLElement[];
};

// Keyboard event helpers
export const pressKey = (element: HTMLElement, key: string, options = {}) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, ...options }));
};

export const pressTab = (element: HTMLElement, shiftKey = false) => {
  pressKey(element, 'Tab', { shiftKey });
};

export const pressEnter = (element: HTMLElement) => {
  pressKey(element, 'Enter');
};

export const pressEscape = (element: HTMLElement) => {
  pressKey(element, 'Escape');
};

export const pressArrowDown = (element: HTMLElement) => {
  pressKey(element, 'ArrowDown');
};

export const pressArrowUp = (element: HTMLElement) => {
  pressKey(element, 'ArrowUp');
};

// Wait for accessibility announcements
export const waitForAnnouncement = async (announcement: string, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Announcement "${announcement}" not found within ${timeout}ms`));
    }, timeout);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.getAttribute('aria-live') && element.textContent?.includes(announcement)) {
                clearTimeout(timer);
                observer.disconnect();
                resolve(true);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
};