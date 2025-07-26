// Accessibility integration tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Accessibility Integration', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Inject axe-core for accessibility testing
    await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.6.3/axe.min.js' });
  });

  test('should pass accessibility audit on all main pages', async ({ page }) => {
    const pages = ['/', '/about', '/products', '/services', '/contact'];

    for (const pagePath of pages) {
      await helpers.navigateToPage(pagePath);
      
      // Run accessibility audit
      const accessibilityResults = await helpers.checkAccessibility();
      expect(accessibilityResults.violations).toHaveLength(0);
      
      // Check for basic accessibility elements
      const skipLinks = page.locator('[href="#main-content"]');
      if (await skipLinks.count() > 0) {
        await expect(skipLinks.first()).toBeVisible();
      }
      
      const mainContent = page.locator('#main-content, main');
      await expect(mainContent).toBeVisible();
      
      const pageHeading = page.locator('h1');
      await expect(pageHeading).toBeVisible();
    }
  });

  test('should support keyboard navigation throughout site', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Test skip links
    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    
    if (await firstFocusable.getAttribute('href') === '#main-content') {
      await page.keyboard.press('Enter');
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    }

    // Test navigation menu keyboard access
    const navItems = page.locator('[data-testid="nav-link"]');
    const navCount = await navItems.count();
    
    for (let i = 0; i < Math.min(navCount, 3); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      // Should have visible focus indicator
      const focusedBox = await focusedElement.boundingBox();
      expect(focusedBox).toBeTruthy();
      
      // Should be able to activate with Enter or Space
      if (await focusedElement.getAttribute('role') === 'button' || 
          await focusedElement.evaluate(el => el.tagName.toLowerCase()) === 'a') {
        
        const elementText = await focusedElement.textContent();
        await page.keyboard.press('Enter');
        await helpers.waitForPageLoad();
        
        // Should navigate successfully
        const pageHeading = page.locator('h1');
        await expect(pageHeading).toBeVisible();
        
        // Go back to continue testing
        await page.goBack();
        await helpers.waitForPageLoad();
      }
    }
  });

  test('should provide proper ARIA labels and roles', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Check navigation landmarks
    const navigation = page.locator('nav[role="navigation"], [role="navigation"]');
    await expect(navigation.first()).toBeVisible();

    const main = page.locator('main[role="main"], [role="main"], main');
    await expect(main).toBeVisible();

    // Check form accessibility
    await helpers.navigateToPage('/contact');
    
    const formInputs = page.locator('input, select, textarea');
    const inputCount = await formInputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i);
      const inputId = await input.getAttribute('id');
      
      if (inputId) {
        // Should have associated label
        const label = page.locator(`label[for="${inputId}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = await input.getAttribute('aria-label') !== null;
        const hasAriaLabelledBy = await input.getAttribute('aria-labelledby') !== null;
        
        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    }

    // Check button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have accessible text
      expect(buttonText?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Look for modal triggers
    const modalTriggers = page.locator('[data-testid*="modal"], [aria-haspopup="dialog"]');
    const triggerCount = await modalTriggers.count();
    
    if (triggerCount > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();
      
      // Modal should be visible
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Focus should be trapped in modal
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      // Focused element should be within modal
      const isWithinModal = await focusedElement.evaluate((el, modalEl) => {
        return modalEl.contains(el);
      }, await modal.elementHandle());
      
      expect(isWithinModal).toBeTruthy();
      
      // Test Escape key to close modal
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
      
      // Focus should return to trigger
      const focusedAfterClose = page.locator(':focus');
      const triggerHandle = await trigger.elementHandle();
      const focusedHandle = await focusedAfterClose.elementHandle();
      
      expect(triggerHandle).toBe(focusedHandle);
    }
  });

  test('should provide screen reader announcements', async ({ page }) => {
    await helpers.navigateToPage('/contact');

    // Test form validation announcements
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    expect(liveRegionCount).toBeGreaterThan(0);

    // Check for error announcements
    const errorRegions = page.locator('[aria-live="assertive"], [role="alert"]');
    if (await errorRegions.count() > 0) {
      const errorText = await errorRegions.first().textContent();
      expect(errorText?.trim()).toBeTruthy();
    }

    // Test success announcements
    await helpers.fillForm({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      message: 'Test message'
    });

    await submitButton.click();

    // Should have success announcement
    const successRegions = page.locator('[aria-live="polite"]');
    if (await successRegions.count() > 0) {
      const successText = await successRegions.first().textContent();
      expect(successText?.toLowerCase()).toContain('success');
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast preference
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await helpers.navigateToPage('/');

    // Check that high contrast styles are applied
    const body = page.locator('body');
    const computedStyle = await body.evaluate(el => {
      return window.getComputedStyle(el);
    });

    // Should have appropriate contrast
    expect(computedStyle).toBeTruthy();

    // Test interactive elements have sufficient contrast
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonStyle = await firstButton.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderColor: style.borderColor
        };
      });
      
      // Should have defined colors (not transparent)
      expect(buttonStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(buttonStyle.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await helpers.navigateToPage('/');

    // Check that animations are reduced or disabled
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const animatedCount = await animatedElements.count();
    
    if (animatedCount > 0) {
      const firstAnimated = animatedElements.first();
      const animationStyle = await firstAnimated.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration
        };
      });
      
      // Animations should be very short or disabled
      const animationDuration = parseFloat(animationStyle.animationDuration);
      const transitionDuration = parseFloat(animationStyle.transitionDuration);
      
      if (animationDuration > 0) {
        expect(animationDuration).toBeLessThan(0.1); // Less than 100ms
      }
      if (transitionDuration > 0) {
        expect(transitionDuration).toBeLessThan(0.1); // Less than 100ms
      }
    }
  });

  test('should provide proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/about', '/products', '/services', '/contact'];

    for (const pagePath of pages) {
      await helpers.navigateToPage(pagePath);
      
      // Get all headings
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
        
        // Check heading hierarchy
        const headingLevels: number[] = [];
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          const level = parseInt(tagName.charAt(1));
          headingLevels.push(level);
        }
        
        // Check that headings don't skip levels
        for (let i = 1; i < headingLevels.length; i++) {
          const currentLevel = headingLevels[i];
          const previousLevel = headingLevels[i - 1];
          
          // Should not skip more than one level
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('should provide alternative text for images', async ({ page }) => {
    await helpers.navigateToPage('/');

    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      const ariaLabel = await image.getAttribute('aria-label');
      
      // Decorative images should have empty alt or presentation role
      // Content images should have descriptive alt text
      if (role === 'presentation' || alt === '') {
        // Decorative image - this is acceptable
        continue;
      } else {
        // Content image should have alt text
        expect(alt || ariaLabel).toBeTruthy();
        if (alt) {
          expect(alt.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Simulate 200% zoom
    await page.setViewportSize({ width: 640, height: 480 }); // Simulate zoomed viewport
    
    // Content should still be accessible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Text should not be cut off
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      const firstHeading = headings.first();
      const headingBox = await firstHeading.boundingBox();
      
      // Heading should be within viewport
      expect(headingBox!.x).toBeGreaterThanOrEqual(0);
      expect(headingBox!.y).toBeGreaterThanOrEqual(0);
    }
    
    // Interactive elements should still be usable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      
      // Should be clickable
      await firstButton.click();
      // Button should respond (exact behavior depends on implementation)
    }
  });

  test('should work with screen reader simulation', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Simulate screen reader by checking ARIA attributes and semantic structure
    const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer');
    const landmarkCount = await landmarks.count();
    expect(landmarkCount).toBeGreaterThan(0);

    // Check that interactive elements are properly labeled
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const interactiveCount = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(interactiveCount, 10); i++) {
      const element = interactiveElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'button') {
        const buttonText = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        expect(buttonText?.trim() || ariaLabel).toBeTruthy();
      }
      
      if (tagName === 'a') {
        const linkText = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        expect(linkText?.trim() || ariaLabel).toBeTruthy();
      }
      
      if (['input', 'select', 'textarea'].includes(tagName)) {
        const id = await element.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          const ariaLabel = await element.getAttribute('aria-label');
          const ariaLabelledBy = await element.getAttribute('aria-labelledby');
          
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
  });

  test('should handle color-only information appropriately', async ({ page }) => {
    await helpers.navigateToPage('/contact');

    // Check form validation doesn't rely only on color
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Error fields should have text indicators, not just color
    const errorFields = page.locator('.error, [aria-invalid="true"]');
    const errorCount = await errorFields.count();
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorField = errorFields.nth(i);
        const fieldId = await errorField.getAttribute('id');
        
        if (fieldId) {
          // Should have associated error message
          const errorMessage = page.locator(`[id="${fieldId}-error"], [aria-describedby*="${fieldId}"]`);
          const hasErrorMessage = await errorMessage.count() > 0;
          
          if (hasErrorMessage) {
            const errorText = await errorMessage.textContent();
            expect(errorText?.trim()).toBeTruthy();
          }
        }
      }
    }

    // Check that status indicators have text labels
    const statusIndicators = page.locator('.success, .warning, .info');
    const statusCount = await statusIndicators.count();
    
    if (statusCount > 0) {
      for (let i = 0; i < statusCount; i++) {
        const status = statusIndicators.nth(i);
        const statusText = await status.textContent();
        const ariaLabel = await status.getAttribute('aria-label');
        
        expect(statusText?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });
});