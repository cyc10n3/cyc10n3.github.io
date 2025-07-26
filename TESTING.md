# Testing Documentation

This document outlines the comprehensive testing strategy for the Wellhead Modern website, including unit tests, integration tests, and end-to-end tests.

## Testing Stack

### Unit Testing
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

### Integration & E2E Testing
- **Playwright** - Cross-browser end-to-end testing
- **axe-core** - Accessibility testing integration

## Test Structure

```
wellhead-modern/
├── src/
│   ├── components/
│   │   └── **/__tests__/          # Unit tests for components
│   ├── hooks/
│   │   └── **/__tests__/          # Unit tests for hooks
│   ├── utils/
│   │   └── **/__tests__/          # Unit tests for utilities
│   ├── test-utils/                # Testing utilities and helpers
│   └── setupTests.ts              # Jest setup configuration
├── e2e/                           # End-to-end tests
│   ├── utils/                     # E2E testing utilities
│   ├── homepage.spec.ts           # Homepage integration tests
│   ├── contact-form.spec.ts       # Contact form tests
│   ├── product-catalog.spec.ts    # Product catalog tests
│   ├── navigation.spec.ts         # Navigation tests
│   ├── accessibility.spec.ts      # Accessibility integration tests
│   └── performance.spec.ts        # Performance tests
├── jest.config.js                 # Jest configuration
├── playwright.config.ts           # Playwright configuration
└── TESTING.md                     # This documentation
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run accessibility-specific unit tests
npm run test:accessibility
```

### End-to-End Tests
```bash
# Install Playwright browsers
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test suites
npm run test:integration
npm run test:performance
npm run test:accessibility:e2e

# Run all tests (unit + E2E)
npm run test:all
```

## Test Categories

### 1. Unit Tests

#### Component Tests
- **Accessibility Components** (`src/components/accessibility/__tests__/`)
  - AccessibleButton - Button variants, states, ARIA attributes
  - AccessibleModal - Focus management, keyboard navigation
  - AccessibleForm - Form validation, labeling, error handling
  - AccessibleNavigation - Keyboard navigation, menu states

#### Utility Tests
- **Accessibility Utils** (`src/utils/__tests__/accessibility.test.ts`)
  - Screen reader announcements
  - Color contrast calculations
  - Keyboard navigation helpers
  - ARIA attribute generation

- **SEO Utils** (`src/utils/__tests__/seo.test.ts`)
  - Meta tag generation
  - Structured data creation
  - Open Graph tags
  - Twitter Card tags

#### Hook Tests
- **Accessibility Hooks** (`src/hooks/__tests__/useAccessibility.test.tsx`)
  - Focus trap management
  - Screen reader integration
  - User preference detection
  - ARIA attribute management

### 2. Integration Tests

#### Homepage Tests (`e2e/homepage.spec.ts`)
- Hero section functionality
- Services preview interaction
- Equipment gallery with lightbox
- Mobile responsiveness
- SEO elements validation
- Performance metrics

#### Contact Form Tests (`e2e/contact-form.spec.ts`)
- Form validation (client-side and server-side)
- File upload functionality
- Loading states and error handling
- Accessibility compliance
- Mobile form interaction

#### Product Catalog Tests (`e2e/product-catalog.spec.ts`)
- Product filtering and search
- Product detail navigation
- Specifications display
- Quote request functionality
- Product comparison
- Pagination and sorting

#### Navigation Tests (`e2e/navigation.spec.ts`)
- Main menu navigation
- Dropdown menus
- Keyboard navigation
- Breadcrumb functionality
- Mobile navigation
- Deep linking support

### 3. Accessibility Tests (`e2e/accessibility.spec.ts`)
- WCAG 2.1 AA compliance across all pages
- Keyboard navigation throughout site
- Screen reader compatibility
- Focus management in modals
- High contrast mode support
- Reduced motion preferences
- Proper heading hierarchy
- Alternative text for images

### 4. Performance Tests (`e2e/performance.spec.ts`)
- Core Web Vitals (LCP, FID, CLS)
- Image optimization and lazy loading
- JavaScript and CSS bundle sizes
- Caching effectiveness
- Font loading optimization
- Mobile performance
- Offline functionality

## Test Coverage

### Coverage Thresholds
- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

### Coverage Reports
Coverage reports are generated in the `coverage/` directory and include:
- HTML report (`coverage/lcov-report/index.html`)
- LCOV format for CI integration
- Text summary in terminal

## Accessibility Testing

### Automated Accessibility Testing
- **axe-core integration** in E2E tests
- **WCAG 2.1 AA compliance** validation
- **Color contrast** checking
- **Keyboard navigation** testing
- **Screen reader** compatibility

### Manual Accessibility Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader announces all important information
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] Focus indicators are visible and clear
- [ ] Error messages are properly associated with form controls
- [ ] Form labels are descriptive and properly associated
- [ ] Navigation is consistent across pages
- [ ] Images have appropriate alternative text
- [ ] Headings follow proper hierarchy (h1 → h2 → h3)
- [ ] Page works with 200% zoom
- [ ] Content is accessible without JavaScript

### Screen Reader Testing
Test with popular screen readers:
- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS)
- **TalkBack** (Android)

## Performance Testing

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Budgets
- **JavaScript Bundle**: < 500KB (compressed)
- **CSS Bundle**: < 100KB (compressed)
- **Images**: WebP/AVIF formats preferred
- **Fonts**: WOFF2 format with font-display: swap

### Performance Testing Tools
- **Lighthouse** - Automated performance auditing
- **WebPageTest** - Real-world performance testing
- **Chrome DevTools** - Performance profiling
- **Playwright** - Automated performance metrics

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

### Test Artifacts
- **Screenshots** on test failures
- **Videos** of test runs
- **Coverage reports**
- **Performance metrics**
- **Accessibility audit results**

## Best Practices

### Writing Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use descriptive test names** that explain the expected behavior
3. **Test user behavior**, not implementation details
4. **Mock external dependencies** appropriately
5. **Keep tests isolated** and independent
6. **Use data-testid** attributes for reliable element selection

### Accessibility Testing
1. **Test with keyboard only** - no mouse interaction
2. **Use screen reader** to verify announcements
3. **Check color contrast** programmatically
4. **Validate ARIA attributes** are correct
5. **Test with different user preferences** (reduced motion, high contrast)

### Performance Testing
1. **Test on various devices** and network conditions
2. **Monitor bundle sizes** and prevent regressions
3. **Validate Core Web Vitals** on every build
4. **Test offline functionality** where applicable
5. **Check resource loading** efficiency

## Debugging Tests

### Unit Test Debugging
```bash
# Debug specific test file
npm test -- --testNamePattern="AccessibleButton"

# Run tests with verbose output
npm test -- --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Test Debugging
```bash
# Run with headed browser
npm run test:e2e:headed

# Debug mode with step-by-step execution
npm run test:e2e:debug

# Run specific test file
npx playwright test homepage.spec.ts

# Generate trace for debugging
npx playwright test --trace on
```

## Continuous Improvement

### Test Metrics to Monitor
- **Test execution time**
- **Test flakiness rate**
- **Coverage trends**
- **Performance regression detection**
- **Accessibility violation trends**

### Regular Test Maintenance
- **Update test dependencies** regularly
- **Review and update test data**
- **Refactor tests** as application evolves
- **Add tests** for new features
- **Remove obsolete tests**

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

This comprehensive testing strategy ensures the Wellhead Modern website meets high standards for functionality, accessibility, and performance while providing confidence in code quality and user experience.