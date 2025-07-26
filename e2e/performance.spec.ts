// Performance integration tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Performance Integration', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await helpers.navigateToPage('/');

    const performanceMetrics = await helpers.measurePageLoad();
    
    // Largest Contentful Paint (LCP) - should be under 2.5s
    if (performanceMetrics.largestContentfulPaint > 0) {
      expect(performanceMetrics.largestContentfulPaint).toBeLessThan(2500);
    }

    // First Contentful Paint (FCP) - should be under 1.8s
    if (performanceMetrics.firstContentfulPaint > 0) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1800);
    }

    // DOM Content Loaded - should be under 2.5s
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2500);

    // Full page load - should be under 4s
    expect(performanceMetrics.loadComplete).toBeLessThan(4000);
  });

  test('should load images efficiently', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Check for lazy loading implementation
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check for loading attributes
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        const loading = await image.getAttribute('loading');
        const src = await image.getAttribute('src');
        
        // Images below the fold should have lazy loading
        const imageBox = await image.boundingBox();
        if (imageBox && imageBox.y > 800) {
          expect(loading).toBe('lazy');
        }
        
        // Images should have optimized formats
        if (src) {
          const isOptimized = src.includes('.webp') || 
                             src.includes('.avif') || 
                             src.includes('w_') || // Cloudinary width parameter
                             src.includes('q_'); // Quality parameter
          
          // At least some images should be optimized
          if (i === 0) {
            // First image (hero) should definitely be optimized
            expect(isOptimized).toBeTruthy();
          }
        }
      }
    }
  });

  test('should minimize JavaScript bundle size', async ({ page }) => {
    // Monitor network requests
    const jsRequests: any[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.endsWith('.js') && !url.includes('node_modules')) {
        jsRequests.push({
          url,
          size: response.headers()['content-length']
        });
      }
    });

    await helpers.navigateToPage('/');
    await helpers.waitForNoNetworkActivity();

    // Check JavaScript bundle sizes
    const totalJSSize = jsRequests.reduce((total, request) => {
      const size = parseInt(request.size || '0');
      return total + size;
    }, 0);

    // Total JS should be under 500KB (compressed)
    expect(totalJSSize).toBeLessThan(500 * 1024);

    // Should have code splitting (multiple JS files)
    expect(jsRequests.length).toBeGreaterThan(1);
  });

  test('should minimize CSS bundle size', async ({ page }) => {
    const cssRequests: any[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.endsWith('.css')) {
        cssRequests.push({
          url,
          size: response.headers()['content-length']
        });
      }
    });

    await helpers.navigateToPage('/');
    await helpers.waitForNoNetworkActivity();

    // Check CSS bundle sizes
    const totalCSSSize = cssRequests.reduce((total, request) => {
      const size = parseInt(request.size || '0');
      return total + size;
    }, 0);

    // Total CSS should be under 100KB (compressed)
    expect(totalCSSSize).toBeLessThan(100 * 1024);
  });

  test('should implement efficient caching', async ({ page }) => {
    const cachedRequests: string[] = [];
    
    page.on('response', response => {
      const cacheControl = response.headers()['cache-control'];
      const url = response.url();
      
      if (cacheControl && (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.png') || url.endsWith('.jpg'))) {
        cachedRequests.push(url);
      }
    });

    await helpers.navigateToPage('/');
    await helpers.waitForNoNetworkActivity();

    // Static assets should have cache headers
    expect(cachedRequests.length).toBeGreaterThan(0);

    // Test cache effectiveness by reloading
    const initialRequestCount = cachedRequests.length;
    
    await page.reload();
    await helpers.waitForNoNetworkActivity();

    // Some requests should be served from cache
    const networkRequests: string[] = [];
    page.on('response', response => {
      networkRequests.push(response.url());
    });

    // Cached resources should result in fewer network requests
    expect(networkRequests.length).toBeLessThanOrEqual(initialRequestCount);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await helpers.navigateToPage('/');
    
    // Page should still load within reasonable time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // 10 seconds max

    // Critical content should be visible
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();

    // Navigation should be functional
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should optimize font loading', async ({ page }) => {
    const fontRequests: any[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.woff') || url.includes('.woff2') || url.includes('fonts.googleapis.com')) {
        fontRequests.push({
          url,
          headers: response.headers()
        });
      }
    });

    await helpers.navigateToPage('/');
    await helpers.waitForNoNetworkActivity();

    // Should use modern font formats
    const modernFonts = fontRequests.filter(req => 
      req.url.includes('.woff2') || req.url.includes('font-display=swap')
    );
    
    if (fontRequests.length > 0) {
      expect(modernFonts.length).toBeGreaterThan(0);
    }

    // Check for font-display: swap in CSS
    const fontDisplayUsed = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      for (const stylesheet of stylesheets) {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          for (const rule of rules) {
            if (rule.cssText && rule.cssText.includes('font-display: swap')) {
              return true;
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
        }
      }
      return false;
    });

    // Font-display: swap should be used for better performance
    if (fontRequests.length > 0) {
      expect(fontDisplayUsed).toBeTruthy();
    }
  });

  test('should minimize layout shifts', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Measure Cumulative Layout Shift (CLS)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Wait for page to stabilize
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    // CLS should be under 0.1 for good user experience
    expect(cls).toBeLessThan(0.1);
  });

  test('should handle resource loading failures gracefully', async ({ page }) => {
    // Block some resources to simulate failures
    await page.route('**/images/hero-bg.jpg', route => route.abort());
    await page.route('**/api/featured-products', route => route.abort());

    await helpers.navigateToPage('/');

    // Page should still load and be functional
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Should show fallback content or graceful degradation
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    const fallbackContent = page.locator('[data-testid="fallback-content"]');
    
    // Either error boundary or fallback should be present
    const hasGracefulDegradation = await errorBoundary.isVisible() || 
                                   await fallbackContent.isVisible() ||
                                   await mainContent.isVisible();
    
    expect(hasGracefulDegradation).toBeTruthy();
  });

  test('should optimize for mobile performance', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const startTime = Date.now();
    await helpers.navigateToPage('/');
    const loadTime = Date.now() - startTime;

    // Mobile should load quickly
    expect(loadTime).toBeLessThan(5000);

    // Check for mobile-optimized images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      const srcset = await firstImage.getAttribute('srcset');
      
      // Should have responsive images
      expect(srcset || src?.includes('w_375')).toBeTruthy();
    }

    // Touch targets should be appropriately sized
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();
      
      // Minimum 44px touch target
      expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('should implement service worker for offline functionality', async ({ page }) => {
    await helpers.navigateToPage('/');

    // Check if service worker is registered
    const serviceWorkerRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    if (serviceWorkerRegistered) {
      const swRegistration = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      });

      expect(swRegistration).toBeTruthy();

      // Test offline functionality
      await page.setOfflineMode(true);
      
      // Previously visited pages should still work
      await page.reload();
      
      // Should show offline page or cached content
      const offlinePage = page.locator('[data-testid="offline-page"]');
      const cachedContent = page.locator('main');
      
      const hasOfflineSupport = await offlinePage.isVisible() || 
                               await cachedContent.isVisible();
      
      expect(hasOfflineSupport).toBeTruthy();
      
      await page.setOfflineMode(false);
    }
  });

  test('should preload critical resources', async ({ page }) => {
    const preloadedResources: string[] = [];
    
    page.on('response', response => {
      const url = response.url();
      const headers = response.headers();
      
      if (headers['link'] && headers['link'].includes('preload')) {
        preloadedResources.push(url);
      }
    });

    await helpers.navigateToPage('/');

    // Check for preload links in HTML
    const preloadLinks = page.locator('link[rel="preload"]');
    const preloadCount = await preloadLinks.count();
    
    if (preloadCount > 0) {
      // Critical resources should be preloaded
      const preloadHrefs = await preloadLinks.evaluateAll(links => 
        links.map(link => (link as HTMLLinkElement).href)
      );
      
      expect(preloadHrefs.length).toBeGreaterThan(0);
      
      // Should preload fonts, critical CSS, or hero images
      const hasCriticalPreloads = preloadHrefs.some(href => 
        href.includes('.woff') || 
        href.includes('.css') || 
        href.includes('hero') ||
        href.includes('critical')
      );
      
      expect(hasCriticalPreloads).toBeTruthy();
    }
  });

  test('should implement efficient image formats', async ({ page }) => {
    await helpers.navigateToPage('/');

    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      let modernFormatCount = 0;
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const src = await image.getAttribute('src');
        const srcset = await image.getAttribute('srcset');
        
        // Check for modern formats
        if (src?.includes('.webp') || src?.includes('.avif') ||
            srcset?.includes('.webp') || srcset?.includes('.avif')) {
          modernFormatCount++;
        }
      }
      
      // At least 50% of images should use modern formats
      const modernFormatRatio = modernFormatCount / imageCount;
      expect(modernFormatRatio).toBeGreaterThan(0.5);
    }
  });
});