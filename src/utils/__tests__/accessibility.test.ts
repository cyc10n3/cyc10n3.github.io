// Tests for accessibility utility functions
import {
  announceToScreenReader,
  checkColorContrast,
  handleArrowKeyNavigation,
  generateAriaAttributes,
  prefersReducedMotion,
  prefersHighContrast,
  runAccessibilityChecks
} from '../accessibility';

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    setAttribute: jest.fn(),
    textContent: '',
    className: ''
  }))
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
});

describe('announceToScreenReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates announcement element with correct attributes', () => {
    const mockElement = {
      setAttribute: jest.fn(),
      textContent: ''
    };
    (document.createElement as jest.Mock).mockReturnValue(mockElement);

    announceToScreenReader('Test message', 'assertive');

    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'sr-only');
    expect(mockElement.textContent).toBe('Test message');
  });

  it('defaults to polite priority', () => {
    const mockElement = {
      setAttribute: jest.fn(),
      textContent: ''
    };
    (document.createElement as jest.Mock).mockReturnValue(mockElement);

    announceToScreenReader('Test message');

    expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
  });

  it('removes element after timeout', () => {
    const mockElement = {
      setAttribute: jest.fn(),
      textContent: ''
    };
    (document.createElement as jest.Mock).mockReturnValue(mockElement);

    announceToScreenReader('Test message');

    expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);

    jest.advanceTimersByTime(1000);

    expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
  });
});

describe('checkColorContrast', () => {
  it('calculates contrast ratio correctly', () => {
    const result = checkColorContrast('#000000', '#ffffff');
    
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.wcagAA).toBe(true);
    expect(result.wcagAAA).toBe(true);
  });

  it('identifies insufficient contrast', () => {
    const result = checkColorContrast('#888888', '#999999');
    
    expect(result.ratio).toBeLessThan(4.5);
    expect(result.wcagAA).toBe(false);
    expect(result.wcagAAA).toBe(false);
  });

  it('handles edge case colors', () => {
    const result = checkColorContrast('#ffffff', '#ffffff');
    
    expect(result.ratio).toBe(1);
    expect(result.wcagAA).toBe(false);
    expect(result.wcagAAA).toBe(false);
  });
});

describe('handleArrowKeyNavigation', () => {
  let mockItems: HTMLElement[];

  beforeEach(() => {
    mockItems = [
      { focus: jest.fn() } as any,
      { focus: jest.fn() } as any,
      { focus: jest.fn() } as any
    ];
  });

  it('navigates right in horizontal mode', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 0, 'ArrowRight', 'horizontal');
    
    expect(newIndex).toBe(1);
    expect(mockItems[1].focus).toHaveBeenCalled();
  });

  it('navigates left in horizontal mode', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 1, 'ArrowLeft', 'horizontal');
    
    expect(newIndex).toBe(0);
    expect(mockItems[0].focus).toHaveBeenCalled();
  });

  it('wraps around at boundaries', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 2, 'ArrowRight', 'horizontal');
    
    expect(newIndex).toBe(0);
    expect(mockItems[0].focus).toHaveBeenCalled();
  });

  it('navigates down in vertical mode', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 0, 'ArrowDown', 'vertical');
    
    expect(newIndex).toBe(1);
    expect(mockItems[1].focus).toHaveBeenCalled();
  });

  it('navigates up in vertical mode', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 1, 'ArrowUp', 'vertical');
    
    expect(newIndex).toBe(0);
    expect(mockItems[0].focus).toHaveBeenCalled();
  });

  it('ignores non-arrow keys', () => {
    const newIndex = handleArrowKeyNavigation(mockItems, 1, 'Enter', 'horizontal');
    
    expect(newIndex).toBe(1);
    expect(mockItems[0].focus).not.toHaveBeenCalled();
    expect(mockItems[2].focus).not.toHaveBeenCalled();
  });
});

describe('generateAriaAttributes', () => {
  it('generates correct ARIA attributes', () => {
    const attributes = generateAriaAttributes({
      label: 'Test label',
      expanded: true,
      selected: false,
      disabled: true,
      required: true,
      invalid: false
    });

    expect(attributes).toEqual({
      'aria-label': 'Test label',
      'aria-expanded': true,
      'aria-selected': false,
      'aria-disabled': true,
      'aria-required': true,
      'aria-invalid': false
    });
  });

  it('omits undefined values', () => {
    const attributes = generateAriaAttributes({
      label: 'Test label',
      expanded: undefined,
      selected: false
    });

    expect(attributes).toEqual({
      'aria-label': 'Test label',
      'aria-selected': false
    });
    expect(attributes).not.toHaveProperty('aria-expanded');
  });

  it('handles all attribute types', () => {
    const attributes = generateAriaAttributes({
      labelledBy: 'label-id',
      describedBy: 'desc-id',
      live: 'assertive',
      atomic: true,
      hidden: false
    });

    expect(attributes).toEqual({
      'aria-labelledby': 'label-id',
      'aria-describedby': 'desc-id',
      'aria-live': 'assertive',
      'aria-atomic': true,
      'aria-hidden': false
    });
  });
});

describe('prefersReducedMotion', () => {
  it('returns false when window is undefined', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const result = prefersReducedMotion();
    expect(result).toBe(false);

    global.window = originalWindow;
  });

  it('returns media query result when window is available', () => {
    const mockMatchMedia = jest.fn(() => ({
      matches: true
    }));
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia
    });

    const result = prefersReducedMotion();
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(result).toBe(true);
  });
});

describe('prefersHighContrast', () => {
  it('returns false when window is undefined', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const result = prefersHighContrast();
    expect(result).toBe(false);

    global.window = originalWindow;
  });

  it('returns media query result when window is available', () => {
    const mockMatchMedia = jest.fn(() => ({
      matches: true
    }));
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia
    });

    const result = prefersHighContrast();
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    expect(result).toBe(true);
  });
});

describe('runAccessibilityChecks', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElement.innerHTML = `
      <img src="test.jpg" alt="Test image" />
      <img src="test2.jpg" />
      <form>
        <label for="input1">Test Input</label>
        <input id="input1" type="text" />
        <input type="text" placeholder="No label" />
      </form>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h4>Heading 4</h4>
      <button>Button with text</button>
      <button aria-label="Icon button">🔍</button>
      <button></button>
      <a href="#test">Link with text</a>
      <a href="#test2"></a>
    `;
  });

  it('identifies images without alt text', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result.issues).toContain('Image 2 missing alt text');
    expect(result.passed).toContain('Image 1 has alt text');
  });

  it('identifies form inputs without labels', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result.issues).toContain('Form input 2 missing label');
    expect(result.passed).toContain('Form input 1 has proper labeling');
  });

  it('identifies heading hierarchy issues', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result.warnings).toContain('Heading 3 skips levels (h2 to h4)');
  });

  it('identifies buttons without accessible text', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result.issues).toContain('Button 3 missing accessible text');
    expect(result.passed).toContain('Button 1 has accessible text');
    expect(result.passed).toContain('Button 2 has accessible text');
  });

  it('identifies links without accessible text', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result.issues).toContain('Link 2 missing accessible text');
    expect(result.passed).toContain('Link 1 has accessible text');
  });

  it('returns comprehensive results', () => {
    const result = runAccessibilityChecks(mockElement);
    
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('passed');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.passed)).toBe(true);
  });
});