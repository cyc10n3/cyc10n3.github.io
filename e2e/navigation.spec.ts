// Navigation integration tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Site Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate through main menu items', async ({ page }) => {
    await helpers.navigateToPage('/');

    const mainNav = page.locator('[data-testid="main-navigation"]');
    await expect(mainNav).toBeVisible();

    // Test each main navigation item
    const navItems = [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Products', url: '/products' },
      { text: 'Services', url: '/services' },
      { text: 'Contact', url: '/contact' }
    ];

    for (const item of navItems) {
      const navLink = page.locator(`[data-testid="nav-link"]:has-text("${item.text}")`);
      await navLink.click();
      await helpers.waitForPageLoad();
      
      expect(page.url()).toContain(item.url);
      
      // Check page loaded correctly
      const pageHeading = page.locator('h1');
      await expect(pageHeading).toBeVisible();
      
      // Check active navigation state
      await expect(navLink).toHaveClass(/active|current/);
    }
  });

  test('should handle dropdown menus', async ({ page }) => {
    await helpers.navigateToPage('/');

    const servicesDropdown = page.locator('[data-testid="services-dropdown"]');
    
    if (await servicesDropdown.isVisible()) {
      // Hover to open dropdown
      await servicesDropdown.hover();
      
      const dropdownMenu = page.locator('[data-testid="services-dropdown-menu"]');
      await expect(dropdownMenu).toBeVisible();

      // Test dropdown items
      const dropdownItems = page.locator('[data-testid="dropdown-item"]');
      const itemCount = await dropdownItems.count();
      
      if (itemCount > 0) {
        const firstItem = dropdownItems.first();
        const itemText = await firstItem.textContent();
        
        await firstItem.click();
        await helpers.waitForPageLoad();
        
        // Should navigate to service page
        expect(page.url()).toContain('/services');
        
        // Page should contain service information
        const serviceContent = page.locator('[data-testid="service-content"]');
        await expect(serviceContent).toBeVisible();
      }
    }
  });

  test('should navigate with keyboard', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Test skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[href="#main-content"]');
    
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter');
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    }

    // Navigate through main menu with keyboard
    const navItems = page.locator('[data-testid="nav-link"]');
    const itemCount = await navItems.count();
    
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      // Should be a navigation link
      const isNavLink = await focusedElement.getAttribute('data-testid') === 'nav-link';
      if (isNavLink) {
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

  test('should show breadcrumb navigation', async ({ page }) => {
    // Navigate to a deep page
    await helpers.navigateToPage('/products/pressure-vessels/separator-123');

    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toBeVisible();

      // Check breadcrumb items
      const breadcrumbItems = page.locator('[data-testid="breadcrumb-item"]');
      const itemCount = await breadcrumbItems.count();
      expect(itemCount).toBeGreaterThan(1);

      // Test breadcrumb navigation
      const homeLink = breadcrumbItems.first();
      await homeLink.click();
      await helpers.waitForPageLoad();
      
      expect(page.url()).toBe('http://localhost:3000/');
    }
  });

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await helpers.navigateToPage('/');

    await helpers.testMobileNavigation();

    // Test mobile menu items
    const mobileNavItems = page.locator('[data-testid="mobile-nav-item"]');
    const itemCount = await mobileNavItems.count();
    
    if (itemCount > 0) {
      const firstItem = mobileNavItems.first();
      await firstItem.click();
      await helpers.waitForPageLoad();
      
      // Should navigate successfully
      const pageHeading = page.locator('h1');
      await expect(pageHeading).toBeVisible();
      
      // Mobile menu should close after navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeHidden();
    }
  });

  test('should maintain navigation state across pages', async ({ page }) => {
    await helpers.navigateToPage('/about');

    // Check active state on about page
    const aboutNavLink = page.locator('[data-testid="nav-link"]:has-text("About")');
    await expect(aboutNavLink).toHaveClass(/active|current/);

    // Navigate to products
    await page.locator('[data-testid="nav-link"]:has-text("Products")').click();
    await helpers.waitForPageLoad();

    // About should no longer be active
    await expect(aboutNavLink).not.toHaveClass(/active|current/);

    // Products should be active
    const productsNavLink = page.locator('[data-testid="nav-link"]:has-text("Products")');
    await expect(productsNavLink).toHaveClass(/active|current/);
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    
    const errorPage = page.locator('[data-testid="404-page"]');
    const errorHeading = page.locator('h1:has-text("404"), h1:has-text("Not Found")');
    
    const hasErrorPage = await errorPage.isVisible() || await errorHeading.isVisible();
    expect(hasErrorPage).toBeTruthy();

    // Should still have navigation
    const mainNav = page.locator('[data-testid="main-navigation"]');
    await expect(mainNav).toBeVisible();

    // Should be able to navigate back to home
    const homeLink = page.locator('[data-testid="nav-link"]:has-text("Home")');
    await homeLink.click();
    await helpers.waitForPageLoad();
    
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Navigate through several pages
    await page.locator('[data-testid="nav-link"]:has-text("About")').click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/about');

    await page.locator('[data-testid="nav-link"]:has-text("Products")').click();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/products');

    // Test browser back button
    await page.goBack();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/about');

    // Test browser forward button
    await page.goForward();
    await helpers.waitForPageLoad();
    expect(page.url()).toContain('/products');

    // Navigation state should be maintained
    const productsNavLink = page.locator('[data-testid="nav-link"]:has-text("Products")');
    await expect(productsNavLink).toHaveClass(/active|current/);
  });

  test('should handle deep linking', async ({ page }) => {
    // Direct navigation to deep page
    await helpers.navigateToPage('/products/pressure-vessels');

    // Page should load correctly
    const pageHeading = page.locator('h1');
    await expect(pageHeading).toBeVisible();

    // Navigation should show correct active state
    const productsNavLink = page.locator('[data-testid="nav-link"]:has-text("Products")');
    await expect(productsNavLink).toHaveClass(/active|current/);

    // Breadcrumb should reflect current location
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      const breadcrumbText = await breadcrumb.textContent();
      expect(breadcrumbText?.toLowerCase()).toContain('pressure vessels');
    }
  });

  test('should maintain scroll position on navigation', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    expect(scrollPosition).toBeGreaterThan(400);

    // Navigate to another page
    await page.locator('[data-testid="nav-link"]:has-text("About")').click();
    await helpers.waitForPageLoad();

    // Should start at top of new page
    const newScrollPosition = await page.evaluate(() => window.pageYOffset);
    expect(newScrollPosition).toBeLessThan(100);

    // Navigate back
    await page.goBack();
    await helpers.waitForPageLoad();

    // Scroll position behavior depends on implementation
    // Just ensure page is functional
    const homeHeading = page.locator('h1');
    await expect(homeHeading).toBeVisible();
  });

  test('should handle navigation with query parameters', async ({ page }) => {
    // Navigate with query parameters
    await helpers.navigateToPage('/products?category=pressure-vessels&sort=name');

    // Check that parameters are preserved in navigation
    expect(page.url()).toContain('category=pressure-vessels');
    expect(page.url()).toContain('sort=name');

    // Navigate to another page
    await page.locator('[data-testid="nav-link"]:has-text("About")').click();
    await helpers.waitForPageLoad();

    // Navigate back to products
    await page.locator('[data-testid="nav-link"]:has-text("Products")').click();
    await helpers.waitForPageLoad();

    // Should go to clean products page (parameters cleared)
    expect(page.url()).toBe('http://localhost:3000/products');
  });

  test('should provide search functionality', async ({ page }) => {
    await helpers.navigateToPage('/');

    const searchInput = page.locator('[data-testid="global-search"]');
    
    if (await searchInput.isVisible()) {
      await helpers.performSearch('pressure vessel', '[data-testid="global-search"]');

      // Should navigate to search results
      expect(page.url()).toContain('search=pressure%20vessel');

      // Check search results
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();

      const resultItems = page.locator('[data-testid="search-result-item"]');
      const resultCount = await resultItems.count();
      
      if (resultCount > 0) {
        // Test clicking on search result
        await resultItems.first().click();
        await helpers.waitForPageLoad();
        
        // Should navigate to the result page
        const pageContent = page.locator('main');
        await expect(pageContent).toBeVisible();
      }
    }
  });

  test('should handle footer navigation', async ({ page }) => {
    await helpers.navigateToPage('/');

    const footer = page.locator('[data-testid="site-footer"]');
    await expect(footer).toBeVisible();

    // Test footer links
    const footerLinks = page.locator('[data-testid="footer-link"]');
    const linkCount = await footerLinks.count();
    
    if (linkCount > 0) {
      const firstFooterLink = footerLinks.first();
      const linkText = await firstFooterLink.textContent();
      
      await firstFooterLink.click();
      await helpers.waitForPageLoad();
      
      // Should navigate successfully
      const pageHeading = page.locator('h1');
      await expect(pageHeading).toBeVisible();
    }

    // Test social media links
    const socialLinks = page.locator('[data-testid="social-link"]');
    const socialCount = await socialLinks.count();
    
    if (socialCount > 0) {
      const firstSocialLink = socialLinks.first();
      const href = await firstSocialLink.getAttribute('href');
      
      // Social links should open in new tab
      expect(await firstSocialLink.getAttribute('target')).toBe('_blank');
      expect(href).toMatch(/^https?:\/\//);
    }
  });
});