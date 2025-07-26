// Product catalog end-to-end tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Product Catalog', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToPage('/products');
  });

  test('should display product listing with categories', async ({ page }) => {
    // Check main product grid
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();

    // Check product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check category navigation
    const categoryNav = page.locator('[data-testid="category-navigation"]');
    await expect(categoryNav).toBeVisible();

    const categoryButtons = page.locator('[data-testid="category-button"]');
    await expect(categoryButtons.first()).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Get initial product count
    const initialProducts = await page.locator('[data-testid="product-card"]').count();
    
    // Click on a category filter
    const pressureVesselsCategory = page.locator('[data-testid="category-button"]:has-text("Pressure Vessels")');
    await pressureVesselsCategory.click();
    await helpers.waitForPageLoad();

    // Check URL updated
    expect(page.url()).toContain('category=pressure-vessels');

    // Check filtered results
    const filteredProducts = await page.locator('[data-testid="product-card"]').count();
    expect(filteredProducts).toBeLessThanOrEqual(initialProducts);

    // Check active category styling
    await expect(pressureVesselsCategory).toHaveClass(/active|selected/);

    // Check product cards show correct category
    const productCategories = page.locator('[data-testid="product-category"]');
    const firstCategoryText = await productCategories.first().textContent();
    expect(firstCategoryText?.toLowerCase()).toContain('pressure');
  });

  test('should search products by name', async ({ page }) => {
    const searchInput = page.locator('[data-testid="product-search"]');
    await expect(searchInput).toBeVisible();

    // Perform search
    await helpers.performSearch('separator', '[data-testid="product-search"]');

    // Check search results
    const searchResults = page.locator('[data-testid="product-card"]');
    const resultCount = await searchResults.count();
    
    if (resultCount > 0) {
      // Check that results contain search term
      const productTitles = page.locator('[data-testid="product-title"]');
      const firstTitle = await productTitles.first().textContent();
      expect(firstTitle?.toLowerCase()).toContain('separator');
    } else {
      // Check for "no results" message
      const noResults = page.locator('[data-testid="no-results"]');
      await expect(noResults).toBeVisible();
    }

    // Check URL updated with search query
    expect(page.url()).toContain('search=separator');
  });

  test('should sort products', async ({ page }) => {
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    await expect(sortDropdown).toBeVisible();

    // Get initial product order
    const initialTitles = await page.locator('[data-testid="product-title"]').allTextContents();

    // Sort by name A-Z
    await helpers.selectOption('[data-testid="sort-dropdown"]', 'name-asc');
    await helpers.waitForPageLoad();

    const sortedTitles = await page.locator('[data-testid="product-title"]').allTextContents();
    
    // Check that titles are sorted alphabetically
    const sortedAlphabetically = [...sortedTitles].sort();
    expect(sortedTitles).toEqual(sortedAlphabetically);

    // Test reverse sort
    await helpers.selectOption('[data-testid="sort-dropdown"]', 'name-desc');
    await helpers.waitForPageLoad();

    const reverseSortedTitles = await page.locator('[data-testid="product-title"]').allTextContents();
    expect(reverseSortedTitles).toEqual(sortedAlphabetically.reverse());
  });

  test('should navigate to product detail page', async ({ page }) => {
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productTitle = await firstProduct.locator('[data-testid="product-title"]').textContent();
    
    await firstProduct.click();
    await helpers.waitForPageLoad();

    // Check URL changed to product detail
    expect(page.url()).toContain('/products/');

    // Check product detail page elements
    const productDetailTitle = page.locator('[data-testid="product-detail-title"]');
    await expect(productDetailTitle).toBeVisible();
    
    const detailTitle = await productDetailTitle.textContent();
    expect(detailTitle).toBe(productTitle);

    // Check product specifications
    const specifications = page.locator('[data-testid="product-specifications"]');
    await expect(specifications).toBeVisible();

    // Check product images
    const productImages = page.locator('[data-testid="product-images"]');
    await expect(productImages).toBeVisible();

    // Check quote request button
    const quoteButton = page.locator('[data-testid="request-quote-button"]');
    await expect(quoteButton).toBeVisible();
  });

  test('should display product specifications table', async ({ page }) => {
    // Navigate to first product
    await page.locator('[data-testid="product-card"]').first().click();
    await helpers.waitForPageLoad();

    const specificationsTable = page.locator('[data-testid="specifications-table"]');
    await expect(specificationsTable).toBeVisible();

    // Check table headers
    const tableHeaders = page.locator('[data-testid="specifications-table"] th');
    await expect(tableHeaders.first()).toBeVisible();

    // Check table data
    const tableRows = page.locator('[data-testid="specifications-table"] tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(1); // Header + at least one data row

    // Check for common specification fields
    const specFields = ['Pressure', 'Temperature', 'Material', 'Size'];
    for (const field of specFields) {
      const fieldCell = page.locator(`td:has-text("${field}")`);
      if (await fieldCell.count() > 0) {
        await expect(fieldCell.first()).toBeVisible();
      }
    }
  });

  test('should handle product image gallery', async ({ page }) => {
    // Navigate to first product
    await page.locator('[data-testid="product-card"]').first().click();
    await helpers.waitForPageLoad();

    const imageGallery = page.locator('[data-testid="product-images"]');
    await expect(imageGallery).toBeVisible();

    const mainImage = page.locator('[data-testid="main-product-image"]');
    await expect(mainImage).toBeVisible();

    // Check thumbnail images
    const thumbnails = page.locator('[data-testid="image-thumbnail"]');
    if (await thumbnails.count() > 1) {
      // Click on second thumbnail
      await thumbnails.nth(1).click();
      
      // Main image should change
      const newMainImageSrc = await mainImage.getAttribute('src');
      const thumbnailSrc = await thumbnails.nth(1).getAttribute('src');
      
      // Images should be related (same base name or similar)
      expect(newMainImageSrc).toBeTruthy();
      expect(thumbnailSrc).toBeTruthy();
    }

    // Test image zoom/lightbox
    await mainImage.click();
    const lightbox = page.locator('[data-testid="image-lightbox"]');
    if (await lightbox.isVisible()) {
      // Test lightbox controls
      const closeButton = page.locator('[data-testid="lightbox-close"]');
      await expect(closeButton).toBeVisible();
      
      await closeButton.click();
      await expect(lightbox).toBeHidden();
    }
  });

  test('should request quote for product', async ({ page }) => {
    // Navigate to first product
    await page.locator('[data-testid="product-card"]').first().click();
    await helpers.waitForPageLoad();

    const quoteButton = page.locator('[data-testid="request-quote-button"]');
    await quoteButton.click();

    // Should open quote modal or navigate to quote page
    const quoteModal = page.locator('[data-testid="quote-modal"]');
    const quotePage = page.locator('[data-testid="quote-form"]');
    
    const hasModal = await quoteModal.isVisible();
    const hasPage = await quotePage.isVisible();
    
    expect(hasModal || hasPage).toBeTruthy();

    if (hasModal) {
      // Test modal quote form
      const productNameField = page.locator('[name="productName"]');
      const productName = await productNameField.inputValue();
      expect(productName).toBeTruthy(); // Should be pre-filled

      // Fill quote form
      await helpers.fillForm({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Company',
        quantity: '5',
        message: 'Please provide a quote for this product.'
      });

      const submitButton = page.locator('[data-testid="submit-quote"]');
      await submitButton.click();

      // Check success message
      const successMessage = page.locator('[data-testid="quote-success"]');
      await expect(successMessage).toBeVisible();
    }
  });

  test('should compare multiple products', async ({ page }) => {
    const compareButtons = page.locator('[data-testid="compare-button"]');
    
    if (await compareButtons.count() > 0) {
      // Add first product to comparison
      await compareButtons.first().click();
      
      // Check compare indicator
      const compareCount = page.locator('[data-testid="compare-count"]');
      await expect(compareCount).toHaveText('1');

      // Add second product
      await compareButtons.nth(1).click();
      await expect(compareCount).toHaveText('2');

      // Open comparison view
      const viewComparisonButton = page.locator('[data-testid="view-comparison"]');
      await viewComparisonButton.click();
      await helpers.waitForPageLoad();

      // Check comparison page
      const comparisonTable = page.locator('[data-testid="comparison-table"]');
      await expect(comparisonTable).toBeVisible();

      // Should show both products
      const comparedProducts = page.locator('[data-testid="compared-product"]');
      await expect(comparedProducts).toHaveCount(2);

      // Test remove from comparison
      const removeButtons = page.locator('[data-testid="remove-from-comparison"]');
      await removeButtons.first().click();
      
      await expect(comparedProducts).toHaveCount(1);
    }
  });

  test('should handle pagination', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      const nextButton = page.locator('[data-testid="next-page"]');
      const pageNumbers = page.locator('[data-testid="page-number"]');
      
      // Get current page products
      const currentProducts = await page.locator('[data-testid="product-card"]').allTextContents();
      
      // Go to next page
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await helpers.waitForPageLoad();
        
        // Check URL updated
        expect(page.url()).toContain('page=2');
        
        // Check different products loaded
        const nextPageProducts = await page.locator('[data-testid="product-card"]').allTextContents();
        expect(nextPageProducts).not.toEqual(currentProducts);
        
        // Test previous button
        const prevButton = page.locator('[data-testid="prev-page"]');
        await prevButton.click();
        await helpers.waitForPageLoad();
        
        expect(page.url()).toContain('page=1');
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Product grid should stack on mobile
    const productCards = page.locator('[data-testid="product-card"]');
    const firstCard = productCards.first();
    const secondCard = productCards.nth(1);
    
    if (await secondCard.isVisible()) {
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      // Cards should stack vertically
      expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height - 10);
    }

    // Test mobile filters
    const mobileFilterButton = page.locator('[data-testid="mobile-filter-button"]');
    if (await mobileFilterButton.isVisible()) {
      await mobileFilterButton.click();
      
      const filterPanel = page.locator('[data-testid="mobile-filter-panel"]');
      await expect(filterPanel).toBeVisible();
      
      // Test filter application
      const categoryFilter = page.locator('[data-testid="mobile-category-filter"]').first();
      await categoryFilter.click();
      
      const applyButton = page.locator('[data-testid="apply-filters"]');
      await applyButton.click();
      
      await expect(filterPanel).toBeHidden();
    }
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Inject axe-core
    await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.6.3/axe.min.js' });
    
    const accessibilityResults = await helpers.checkAccessibility();
    expect(accessibilityResults.violations).toHaveLength(0);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Navigate through product cards
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = Math.min(await productCards.count(), 3); // Test first 3 cards
    
    for (let i = 0; i < cardCount; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      
      // Should be able to activate with Enter
      if (await focusedElement.getAttribute('role') === 'button' || 
          await focusedElement.evaluate(el => el.tagName.toLowerCase()) === 'a') {
        await page.keyboard.press('Enter');
        await helpers.waitForPageLoad();
        
        // Should navigate to product detail
        expect(page.url()).toContain('/products/');
        
        // Go back to continue testing
        await page.goBack();
        await helpers.waitForPageLoad();
      }
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Slow down network requests
    await page.route('**/api/products**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await helpers.navigateToPage('/products');

    // Check loading state
    const loadingIndicator = page.locator('[data-testid="loading-products"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
      
      // Wait for products to load
      await expect(loadingIndicator).toBeHidden();
    }

    // Products should be visible after loading
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();
  });
});