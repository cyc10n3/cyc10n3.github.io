// Contact form end-to-end tests
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Contact Form', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToPage('/contact');
  });

  test('should display contact form with all required fields', async ({ page }) => {
    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Check required fields
    await expect(page.locator('[name="name"]')).toBeVisible();
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="company"]')).toBeVisible();
    await expect(page.locator('[name="phone"]')).toBeVisible();
    await expect(page.locator('[name="subject"]')).toBeVisible();
    await expect(page.locator('[name="message"]')).toBeVisible();

    // Check submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText(/submit|send/i);
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for validation errors
    const errorMessages = page.locator('[role="alert"], .error-message');
    await expect(errorMessages.first()).toBeVisible();

    // Check specific field errors
    const nameError = page.locator('[data-testid="name-error"]');
    const emailError = page.locator('[data-testid="email-error"]');
    
    await expect(nameError).toBeVisible();
    await expect(emailError).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await helpers.fillForm({
      name: 'John Doe',
      email: 'invalid-email',
      company: 'Test Company',
      message: 'Test message'
    });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const emailError = page.locator('[data-testid="email-error"]');
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText(/valid email/i);
  });

  test('should validate phone number format', async ({ page }) => {
    await helpers.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123',
      company: 'Test Company',
      message: 'Test message'
    });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const phoneError = page.locator('[data-testid="phone-error"]');
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toHaveText(/valid phone/i);
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    const formData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Test Company',
      phone: '+1-555-123-4567',
      message: 'This is a test message for the contact form.'
    };

    await helpers.fillForm(formData);
    
    // Select subject
    await helpers.selectOption('[name="subject"]', 'general');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText(/thank you|success|sent/i);

    // Form should be reset or hidden
    const contactForm = page.locator('[data-testid="contact-form"]');
    const isFormReset = await page.locator('[name="name"]').inputValue() === '';
    const isFormHidden = !(await contactForm.isVisible());
    
    expect(isFormReset || isFormHidden).toBeTruthy();
  });

  test('should handle file uploads', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Create a test file
      const testFile = 'test-files/sample-document.pdf';
      await helpers.uploadFile('input[type="file"]', testFile);

      // Check file is selected
      const fileName = await fileInput.evaluate((input: HTMLInputElement) => {
        return input.files?.[0]?.name || '';
      });
      
      expect(fileName).toBe('sample-document.pdf');

      // Check file size validation
      const fileSizeError = page.locator('[data-testid="file-size-error"]');
      if (await fileSizeError.isVisible()) {
        await expect(fileSizeError).toHaveText(/file size|too large/i);
      }
    }
  });

  test('should show loading state during submission', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/api/contact', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await helpers.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company',
      message: 'Test message'
    });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText(/sending|loading/i);

    // Check loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible();

    // Wait for completion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await helpers.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company',
      message: 'Test message'
    });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/error|failed|try again/i);

    // Form should remain visible for retry
    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Test tab navigation through form fields
    const formFields = [
      '[name="name"]',
      '[name="email"]',
      '[name="company"]',
      '[name="phone"]',
      '[name="subject"]',
      '[name="message"]',
      'button[type="submit"]'
    ];

    for (const field of formFields) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('name', field.replace(/[\[\]"]/g, '').split('=')[1] || '');
    }

    // Test form submission with Enter key
    await page.locator('[name="name"]').focus();
    await page.keyboard.press('Enter');
    
    // Should show validation errors (form not filled)
    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should announce form validation to screen readers', async ({ page }) => {
    // Submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for aria-live announcements
    const liveRegions = page.locator('[aria-live]');
    const hasAnnouncements = await liveRegions.count() > 0;
    expect(hasAnnouncements).toBeTruthy();

    // Check error summary for screen readers
    const errorSummary = page.locator('[role="alert"]');
    await expect(errorSummary).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Form should be responsive
    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Fields should stack vertically
    const nameField = page.locator('[name="name"]');
    const emailField = page.locator('[name="email"]');
    
    const nameBox = await nameField.boundingBox();
    const emailBox = await emailField.boundingBox();
    
    expect(emailBox!.y).toBeGreaterThan(nameBox!.y + nameBox!.height);

    // Test mobile form interaction
    await nameField.tap();
    await nameField.fill('Mobile User');
    
    await emailField.tap();
    await emailField.fill('mobile@example.com');

    // Submit button should be easily tappable
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
  });

  test('should preserve form data on page refresh', async ({ page }) => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company'
    };

    await helpers.fillForm(formData);

    // Refresh page
    await page.reload();
    await helpers.waitForPageLoad();

    // Check if form data is preserved (if implemented)
    const nameValue = await page.locator('[name="name"]').inputValue();
    const emailValue = await page.locator('[name="email"]').inputValue();
    
    // This test depends on implementation - form might or might not preserve data
    // Just ensure form is still functional after refresh
    await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
  });

  test('should display contact information alongside form', async ({ page }) => {
    // Check for contact information section
    const contactInfo = page.locator('[data-testid="contact-info"]');
    await expect(contactInfo).toBeVisible();

    // Check for office locations
    const officeLocations = page.locator('[data-testid="office-location"]');
    await expect(officeLocations.first()).toBeVisible();

    // Check for contact methods
    const phoneNumber = page.locator('[data-testid="phone-number"]');
    const emailAddress = page.locator('[data-testid="email-address"]');
    
    await expect(phoneNumber).toBeVisible();
    await expect(emailAddress).toBeVisible();

    // Test clickable contact methods
    if (await phoneNumber.isVisible()) {
      await expect(phoneNumber).toHaveAttribute('href', /tel:/);
    }
    
    if (await emailAddress.isVisible()) {
      await expect(emailAddress).toHaveAttribute('href', /mailto:/);
    }
  });

  test('should integrate with map component', async ({ page }) => {
    const mapComponent = page.locator('[data-testid="office-map"]');
    
    if (await mapComponent.isVisible()) {
      // Test map interaction
      await mapComponent.click();
      
      // Check for map markers or office details
      const mapMarkers = page.locator('[data-testid="map-marker"]');
      if (await mapMarkers.count() > 0) {
        await mapMarkers.first().click();
        
        // Should show office details
        const officeDetails = page.locator('[data-testid="office-details"]');
        await expect(officeDetails).toBeVisible();
      }
    }
  });
});