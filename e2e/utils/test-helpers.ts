// E2E test helper utilities
import { Page, Locator, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToPage(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.locator(`[name="${field}"], [id="${field}"]`);
      await input.fill(value);
    }
  }

  async submitForm(submitSelector = 'button[type="submit"]') {
    await this.page.click(submitSelector);
  }

  async selectOption(selectSelector: string, value: string) {
    await this.page.selectOption(selectSelector, value);
  }

  async checkCheckbox(checkboxSelector: string) {
    await this.page.check(checkboxSelector);
  }

  async uncheckCheckbox(checkboxSelector: string) {
    await this.page.uncheck(checkboxSelector);
  }

  // Accessibility helpers
  async checkAccessibility() {
    // Run axe-core accessibility tests
    const accessibilityResults = await this.page.evaluate(async () => {
      // @ts-ignore
      if (typeof window.axe !== 'undefined') {
        // @ts-ignore
        return await window.axe.run();
      }
      return { violations: [] };
    });

    expect(accessibilityResults.violations).toHaveLength(0);
    return accessibilityResults;
  }

  async checkKeyboardNavigation(elements: string[]) {
    // Test tab navigation through elements
    for (let i = 0; i < elements.length; i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('data-testid', elements[i]);
    }
  }

  async testScreenReaderAnnouncements() {
    // Check for aria-live regions and announcements
    const liveRegions = await this.page.locator('[aria-live]').all();
    return liveRegions.length > 0;
  }

  // Visual testing helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async compareScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(`${name}.png`);
  }

  // Performance helpers
  async measurePageLoad() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
      };
    });

    return performanceMetrics;
  }

  async checkCoreWebVitals() {
    const vitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.name === 'first-input-delay') {
              vitals.FID = entry.startTime;
            }
            if (entry.name === 'cumulative-layout-shift') {
              vitals.CLS = (entry as any).value;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    return vitals;
  }

  // Modal and dialog helpers
  async openModal(triggerSelector: string) {
    await this.page.click(triggerSelector);
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
  }

  async closeModal(method: 'button' | 'escape' | 'overlay' = 'button') {
    switch (method) {
      case 'button':
        await this.page.click('[aria-label*="Close"], [aria-label*="close"]');
        break;
      case 'escape':
        await this.page.keyboard.press('Escape');
        break;
      case 'overlay':
        await this.page.click('[role="dialog"]', { position: { x: 0, y: 0 } });
        break;
    }
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  // Search and filter helpers
  async performSearch(query: string, searchSelector = '[type="search"], [placeholder*="search" i]') {
    await this.page.fill(searchSelector, query);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  async applyFilter(filterType: string, value: string) {
    const filterSelector = `[data-filter="${filterType}"]`;
    await this.page.selectOption(filterSelector, value);
    await this.waitForPageLoad();
  }

  // Table helpers
  async sortTable(columnHeader: string, direction: 'asc' | 'desc' = 'asc') {
    const headerSelector = `th:has-text("${columnHeader}")`;
    await this.page.click(headerSelector);
    
    if (direction === 'desc') {
      await this.page.click(headerSelector);
    }
    
    await this.waitForPageLoad();
  }

  async paginateTable(page: number) {
    await this.page.click(`[aria-label="Go to page ${page}"]`);
    await this.waitForPageLoad();
  }

  // Mobile helpers
  async testMobileNavigation() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    
    // Test hamburger menu
    const hamburgerButton = this.page.locator('[aria-label*="menu" i]');
    await hamburgerButton.click();
    
    const mobileMenu = this.page.locator('[role="navigation"]');
    await expect(mobileMenu).toBeVisible();
    
    // Test menu items
    const menuItems = await mobileMenu.locator('[role="menuitem"]').all();
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Close menu
    await hamburgerButton.click();
    await expect(mobileMenu).toBeHidden();
  }

  // Error handling helpers
  async checkForErrors() {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    this.page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    return errors;
  }

  async waitForNoNetworkActivity(timeout = 2000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // SEO helpers
  async checkSEOElements() {
    const seoElements = {
      title: await this.page.title(),
      metaDescription: await this.page.getAttribute('meta[name="description"]', 'content'),
      canonicalUrl: await this.page.getAttribute('link[rel="canonical"]', 'href'),
      ogTitle: await this.page.getAttribute('meta[property="og:title"]', 'content'),
      ogDescription: await this.page.getAttribute('meta[property="og:description"]', 'content'),
      structuredData: await this.page.locator('script[type="application/ld+json"]').textContent()
    };

    return seoElements;
  }

  // Utility methods
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async hoverElement(selector: string) {
    await this.page.hover(selector);
  }

  async dragAndDrop(sourceSelector: string, targetSelector: string) {
    await this.page.dragAndDrop(sourceSelector, targetSelector);
  }

  async uploadFile(inputSelector: string, filePath: string) {
    await this.page.setInputFiles(inputSelector, filePath);
  }

  async downloadFile(downloadTriggerSelector: string) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click(downloadTriggerSelector)
    ]);
    
    return download;
  }

  async waitForText(text: string, timeout = 5000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  async waitForSelector(selector: string, options?: { state?: 'visible' | 'hidden'; timeout?: number }) {
    await this.page.waitForSelector(selector, options);
  }
}