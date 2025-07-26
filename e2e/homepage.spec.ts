// Homepage end-to-end tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Homepage', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToPage('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Wellhead/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display hero section with CTA buttons', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    const primaryCTA = page.locator('[data-testid="hero-primary-cta"]');
    const secondaryCTA = page.locator('[data-testid="hero-secondary-cta"]');
    
    await expect(primaryCTA).toBeVisible();
    await expect(secondaryCTA).toBeVisible();
    
    // Test CTA functionality
    await primaryCTA.click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/contact');
  });

  test('should display services preview section', async ({ page }) => {
    const servicesSection = page.locator('[data-testid="services-preview"]');
    await expect(servicesSection).toBeVisible();

    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards).toHaveCount(4); // Assuming 4 main services

    // Test service card interaction
    const firstServiceCard = serviceCards.first();
    await firstServiceCard.hover();
    await expect(firstServiceCard).toHaveClass(/hover/);

    await firstServiceCard.click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/services');
  });

  test('should display about preview section', async ({ page }) => {
    const aboutSection = page.locator('[data-testid="about-preview"]');
    await expect(aboutSection).toBeVisible();

    const missionStatement = page.locator('[data-testid="mission-statement"]');
    const visionStatement = page.locator('[data-testid="vision-statement"]');
    
    await expect(missionStatement).toBeVisible();
    await expect(visionStatement).toBeVisible();

    // Test about CTA
    const aboutCTA = page.locator('[data-testid="about-cta"]');
    await aboutCTA.click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/about');
  });

  test('should display equipment gallery', async ({ page }) => {
    const gallery = page.locator('[data-testid="equipment-gallery"]');
    await expect(gallery).toBeVisible();

    const galleryImages = page.locator('[data-testid="gallery-image"]');
    await expect(galleryImages.first()).toBeVisible();

    // Test lightbox functionality
    await galleryImages.first().click();
    const lightbox = page.locator('[data-testid="lightbox"]');
    await expect(lightbox).toBeVisible();

    // Test lightbox navigation
    const nextButton = page.locator('[data-testid="lightbox-next"]');
    const prevButton = page.locator('[data-testid="lightbox-prev"]');
    const closeButton = page.locator('[data-testid="lightbox-close"]');

    await expect(nextButton).toBeVisible();
    await expect(prevButton).toBeVisible();
    await expect(closeButton).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Escape');
    
    await expect(lightbox).toBeHidden();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile navigation
    await helpers.testMobileNavigation();
    
    // Test hero section on mobile
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();
    
    // Test service cards stack vertically on mobile
    const serviceCards = page.locator('[data-testid="service-card"]');
    const firstCard = serviceCards.first();
    const secondCard = serviceCards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Cards should be stacked vertically (second card below first)
    expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height);
  });

  test('should have proper SEO elements', async ({ page }) => {
    const seoElements = await helpers.checkSEOElements();
    
    expect(seoElements.title).toBeTruthy();
    expect(seoElements.metaDescription).toBeTruthy();
    expect(seoElements.canonicalUrl).toBeTruthy();
    expect(seoElements.ogTitle).toBeTruthy();
    expect(seoElements.ogDescription).toBeTruthy();
    
    // Check structured data
    expect(seoElements.structuredData).toBeTruthy();
    const structuredData = JSON.parse(seoElements.structuredData!);
    expect(structuredData['@type']).toBe('Organization');
  });

  test('should meet accessibility standards', async ({ page }) => {
    // Inject axe-core for accessibility testing
    await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.6.3/axe.min.js' });
    
    const accessibilityResults = await helpers.checkAccessibility();
    expect(accessibilityResults.violations).toHaveLength(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    }
  });

  test('should load within performance budgets', async ({ page }) => {
    const performanceMetrics = await helpers.measurePageLoad();
    
    // Core Web Vitals thresholds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2500); // 2.5s
    expect(performanceMetrics.loadComplete).toBeLessThan(4000); // 4s
    
    if (performanceMetrics.firstContentfulPaint > 0) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1800); // 1.8s
    }
    
    if (performanceMetrics.largestContentfulPaint > 0) {
      expect(performanceMetrics.largestContentfulPaint).toBeLessThan(2500); // 2.5s
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    const errors = await helpers.checkForErrors();
    
    // Simulate network error
    await page.route('**/api/**', route => route.abort());
    await page.reload();
    
    // Should show error state or fallback content
    const errorMessage = page.locator('[data-testid="error-message"]');
    const fallbackContent = page.locator('[data-testid="fallback-content"]');
    
    const hasErrorHandling = await errorMessage.isVisible() || await fallbackContent.isVisible();
    expect(hasErrorHandling).toBeTruthy();
  });

  test('should work with JavaScript disabled', async ({ page, context }) => {
    // Disable JavaScript
    await context.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (compatible; test-bot)' });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (compatible; test-bot)'
      });
    });
    
    await helpers.navigateToPage('/');
    
    // Basic content should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Links should work
    const aboutLink = page.locator('a[href="/about"]');
    await aboutLink.click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/about');
  });
});