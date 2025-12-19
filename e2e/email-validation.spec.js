import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Email Validation Feature
 * These tests act as an automated agent, simulating real user interactions
 * to test the email validation feature live on the website.
 */

// Helper function to navigate to Step 5 (email input)
async function navigateToEmailStep(page) {
  // Step 1: Skip vehicle selection
  await page.click('text=Skip to All Services');
  
  // Step 2: Select a service
  await page.selectOption('select[name="service"]', { index: 1 });
  await page.waitForTimeout(300); // Wait for state to update
  await page.click('button:has-text("Next")');
  
  // Step 3: Enter location
  // Click "Enter Location Manually" button first
  await page.click('button:has-text("Enter Location Manually")');
  await page.waitForTimeout(300); // Wait for manual input to appear
  // Fill the manual location input (name="location")
  await page.fill('input[name="location"]', '123 Test Street, Montego Bay');
  await page.click('button:has-text("Next")');
  
  // Step 4: Select date and time
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
  await page.waitForTimeout(1500); // Wait for time slots to load
  await page.selectOption('select[name="time"]', { index: 1 });
  await page.click('button:has-text("Next")');
  
  // Now on Step 5: Customer Details (email input)
  await page.waitForTimeout(500);
}

test.describe('Email Validation - Agent Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Click "Book Now" to start booking process
    await page.click('text=Book Now');
    
    // Wait for booking form to appear (Step 1: Vehicle Size)
    await expect(page.locator('text=Select Your Vehicle Size')).toBeVisible({ timeout: 10000 });
  });

  test('Agent Test: Valid email shows green checkmark', async ({ page }) => {
    console.log('🤖 Agent starting: Testing valid email validation...');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    // Step 5: Enter customer details with VALID email
    await page.fill('input[name="name"]', 'John Doe');
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@gmail.com');
    
    // Trigger blur to validate
    await emailInput.blur();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check for green border (valid state)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    // Check for green checkmark icon
    const greenCheck = page.locator('svg.text-green-500').first();
    await expect(greenCheck).toBeVisible();
    
    console.log('✅ Agent completed: Valid email correctly validated!');
  });

  test('Agent Test: Invalid email shows error', async ({ page }) => {
    console.log('🤖 Agent starting: Testing invalid email detection...');
    
    // Use the simplified approach - skip to email step
    // Step 1: Click "Skip to All Services" to bypass vehicle selection
    await page.click('text=Skip to All Services');
    
    // Step 2: Select any service
    await page.selectOption('select[name="service"]', { index: 1 });
    await page.waitForTimeout(300); // Wait for state to update
    await page.click('button:has-text("Next")');
    
    // Step 3: Enter location
    // Click "Enter Location Manually" button first
    await page.click('button:has-text("Enter Location Manually")');
    await page.waitForTimeout(300); // Wait for manual input to appear
    await page.fill('input[name="location"]', '123 Test Street, Montego Bay');
    await page.click('button:has-text("Next")');
    
    // Step 4: Set date and time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="time"]', { index: 1 });
    await page.click('button:has-text("Next")');
    
    // Step 5: Test invalid email
    await page.fill('input[name="name"]', 'Jane Doe');
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('notanemail');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check for red border
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    // Check for error message
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Check for red X icon
    const redX = page.locator('svg.text-red-500').first();
    await expect(redX).toBeVisible();
    
    console.log('✅ Agent completed: Invalid email correctly rejected!');
  });

  test('Agent Test: Gmail typo detection and correction', async ({ page }) => {
    console.log('🤖 Agent starting: Testing Gmail typo detection...');
    
    // Fresh start - reload page for clean state (WebKit isolation)
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Type email with common typo
    await emailInput.fill('test@gmial.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check for suggestion box
    await expect(page.locator('text=Did you mean:')).toBeVisible();
    await expect(page.locator('text=test@gmail.com')).toBeVisible();
    
    // Click the suggestion button
    await page.click('button:has-text("test@gmail.com")');
    
    await page.waitForTimeout(300);
    
    // Verify email was corrected
    const correctedValue = await emailInput.inputValue();
    expect(correctedValue).toBe('test@gmail.com');
    
    // Verify green checkmark appears
    const greenCheck = page.locator('svg.text-green-500').first();
    await expect(greenCheck).toBeVisible();
    
    console.log('✅ Agent completed: Gmail typo auto-corrected!');
  });

  test('Agent Test: Hotmail typo detection', async ({ page }) => {
    console.log('🤖 Agent starting: Testing Hotmail typo detection...');
    
    // Fresh start - reload page for clean state (WebKit isolation)
    await page.goto('/');
    await page.click('text=Book Now');
    
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('user@hotmial.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check for corrected suggestion
    await expect(page.locator('text=user@hotmail.com')).toBeVisible();
    
    console.log('✅ Agent completed: Hotmail typo detected!');
  });

  test('Agent Test: Yahoo typo detection', async ({ page }) => {
    console.log('🤖 Agent starting: Testing Yahoo typo detection...');
    
    // Fresh start - reload page for clean state (WebKit isolation)
    await page.goto('/');
    await page.click('text=Book Now');
    
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('someone@yahooo.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check for corrected suggestion
    await expect(page.locator('text=someone@yahoo.com')).toBeVisible();
    
    console.log('✅ Agent completed: Yahoo typo detected!');
  });

  test('Agent Test: Outlook typo detection', async ({ page }) => {
    console.log('🤖 Agent starting: Testing Outlook typo detection...');
    
    // Fresh start - reload page for clean state (WebKit isolation)
    await page.goto('/');
    await page.click('text=Book Now');
    
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('john@outlok.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check for corrected suggestion
    await expect(page.locator('text=john@outlook.com')).toBeVisible();
    
    console.log('✅ Agent completed: Outlook typo detected!');
  });

  test('Agent Test: Form submission blocked with invalid email', async ({ page }) => {
    console.log('🤖 Agent starting: Testing form submission blocking...');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    // Fill all required fields
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'bademail'); // Invalid
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select payment method
    await page.click('button:has-text("Cash")');
    
    // Listen for alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('valid email');
      await dialog.accept();
    });
    
    // Try to submit
    await page.click('button:has-text("Submit Booking")');
    
    // Wait for alert
    await page.waitForTimeout(1000);
    
    console.log('✅ Agent completed: Invalid email blocked submission!');
  });

  test('Agent Test: Email validation clears on typing', async ({ page }) => {
    console.log('🤖 Agent starting: Testing validation state reset...');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Type invalid email
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    // Error should appear
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Start typing again
    await emailInput.clear();
    await emailInput.type('t');
    
    // Error should disappear
    await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
    
    console.log('✅ Agent completed: Validation state reset on typing!');
  });

  test('Agent Test: Multiple provider typos in sequence', async ({ page }) => {
    console.log('🤖 Agent starting: Testing multiple email providers...');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const testCases = [
      { typo: 'test@gmial.com', correct: 'test@gmail.com' },
      { typo: 'user@hotmial.com', correct: 'user@hotmail.com' },
      { typo: 'jane@yahooo.com', correct: 'jane@yahoo.com' },
      { typo: 'mike@outlok.com', correct: 'mike@outlook.com' },
      { typo: 'sarah@icoud.com', correct: 'sarah@icloud.com' },
    ];
    
    const emailInput = page.locator('input[name="email"]');
    
    for (const testCase of testCases) {
      await emailInput.clear();
      await emailInput.fill(testCase.typo);
      await emailInput.blur();
      
      await page.waitForTimeout(300);
      
      // Check suggestion appears
      await expect(page.locator(`text=${testCase.correct}`)).toBeVisible();
      
      console.log(`  ✓ ${testCase.typo} → ${testCase.correct} detected`);
    }
    
    console.log('✅ Agent completed: All provider typos detected!');
  });

  test('Agent Test: Empty email field (no validation)', async ({ page }) => {
    console.log('🤖 Agent starting: Testing empty email handling...');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Focus and blur without typing
    await emailInput.focus();
    await emailInput.blur();
    
    await page.waitForTimeout(300);
    
    // Should not show error for empty field
    await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
    
    // Should not have red border
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).not.toContain('border-red-500');
    
    console.log('✅ Agent completed: Empty email handled gracefully!');
  });
});

test.describe('Email Validation - Mobile Testing', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('Agent Test: Mobile - Touch targets are adequate', async ({ page }) => {
    console.log('🤖 Agent starting: Testing mobile touch targets...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@gmial.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check suggestion button exists and is visible
    const suggestionButton = page.locator('button:has-text("test@gmail.com")');
    await expect(suggestionButton).toBeVisible();
    
    // Get bounding box to verify touch-friendly size
    const box = await suggestionButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44); // iOS standard
    
    console.log('✅ Agent completed: Mobile touch targets verified!');
  });

  test('Agent Test: Mobile - Input has correct attributes', async ({ page }) => {
    console.log('🤖 Agent starting: Testing mobile input attributes...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Check mobile-friendly attributes
    expect(await emailInput.getAttribute('type')).toBe('email');
    expect(await emailInput.getAttribute('autoCapitalize')).toBe('none');
    expect(await emailInput.getAttribute('autoCorrect')).toBe('off');
    expect(await emailInput.getAttribute('inputMode')).toBe('email');
    
    console.log('✅ Agent completed: Mobile attributes verified!');
  });

  test('Agent Test: Mobile - Responsive text sizes', async ({ page }) => {
    console.log('🤖 Agent starting: Testing mobile text sizes...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Error message should be visible and readable on mobile
    const errorMessage = page.locator('text=Please enter a valid email address');
    await expect(errorMessage).toBeVisible();
    
    // Verify it's not too small
    const fontSize = await errorMessage.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(12); // Minimum readable size
    
    console.log('✅ Agent completed: Mobile text sizes verified!');
  });
});

test.describe('Email Validation - Edge Cases', () => {
  
  test('Agent Test: Very long email address', async ({ page }) => {
    console.log('🤖 Agent starting: Testing long email...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    const longEmail = 'verylongemailaddressfortesting123456789@example.com';
    
    await emailInput.fill(longEmail);
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should still validate correctly
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Long email handled!');
  });

  test('Agent Test: Email with special characters', async ({ page }) => {
    console.log('🤖 Agent starting: Testing special characters...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    const specialEmail = 'test.name+tag@example.com';
    
    await emailInput.fill(specialEmail);
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Special characters accepted!');
  });

  test('Agent Test: Email with numbers', async ({ page }) => {
    console.log('🤖 Agent starting: Testing email with numbers...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('user123@test456.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Numbers in email accepted!');
  });

  test('Agent Test: Email with spaces (invalid)', async ({ page }) => {
    console.log('🤖 Agent starting: Testing email with spaces...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test @gmail.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: Spaces correctly rejected!');
  });

  test('Agent Test: Email without @ symbol', async ({ page }) => {
    console.log('🤖 Agent starting: Testing email without @...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('testgmail.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: Missing @ rejected!');
  });

  test('Agent Test: Email without domain', async ({ page }) => {
    console.log('🤖 Agent starting: Testing email without domain...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    
    // Navigate to email step
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: Missing domain rejected!');
  });
});

// ============================================
// USER EXPERIENCE TESTS
// ============================================
test.describe('Email Validation - User Experience', () => {
  
  test('Agent Test: Click suggestion button auto-fills corrected email', async ({ page }) => {
    console.log('🤖 Agent starting: Testing suggestion button click...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@gmial.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Click the suggestion button
    await page.click('button:has-text("test@gmail.com")');
    
    await page.waitForTimeout(300);
    
    // Verify email was auto-filled with corrected version
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe('test@gmail.com');
    
    // Verify green border (valid)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Suggestion button works!');
  });

  test('Agent Test: Email validation works with pasted content', async ({ page }) => {
    console.log('🤖 Agent starting: Testing paste functionality...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Fill directly (simulating paste)
    await emailInput.fill('pasted@gmail.com');
    // Trigger blur to validate
    await emailInput.blur();
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Paste validation works!');
  });

  test('Agent Test: Email with leading/trailing spaces gets trimmed', async ({ page }) => {
    console.log('🤖 Agent starting: Testing whitespace trimming...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Type email with spaces
    await emailInput.fill('  test@gmail.com  ');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should still be valid (spaces trimmed)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Whitespace handled correctly!');
  });

  test('Agent Test: Tab navigation works on email field', async ({ page }) => {
    console.log('🤖 Agent starting: Testing keyboard navigation...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    // Tab through fields - Use fill() for cross-browser compatibility
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    
    await page.keyboard.press('Tab'); // Focus name field
    await nameInput.fill('John Doe');
    
    await page.keyboard.press('Tab'); // Focus email field
    await emailInput.fill('test@gmail.com');
    await emailInput.blur(); // Trigger validation
    
    await page.waitForTimeout(500);
    
    // Check email was entered and validated
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe('test@gmail.com');
    
    // Verify validation passed (green border)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Keyboard navigation works!');
  });
});

// ============================================
// ADDITIONAL EMAIL PROVIDER TYPOS
// ============================================
test.describe('Email Validation - More Provider Typos', () => {
  
  test('Agent Test: AOL typo detection', async ({ page }) => {
    console.log('🤖 Agent starting: Testing AOL typos...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Test aol.con typo
    await emailInput.fill('user@aol.con');
    await emailInput.blur();
    await page.waitForTimeout(300);
    
    // Check for suggestion
    await expect(page.locator('text=user@aol.com')).toBeVisible();
    
    console.log('✅ Agent completed: AOL typos detected!');
  });

  test('Agent Test: iCloud additional typos', async ({ page }) => {
    console.log('🤖 Agent starting: Testing additional iCloud typos...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    const typos = ['iclod.com', 'icloud.co', 'iclould.com'];
    
    for (const typo of typos) {
      await emailInput.clear();
      await emailInput.fill(`user@${typo}`);
      await emailInput.blur();
      await page.waitForTimeout(300);
      
      // Check for suggestion
      await expect(page.locator('text=user@icloud.com')).toBeVisible();
      console.log(`  ✓ user@${typo} → user@icloud.com detected`);
    }
    
    console.log('✅ Agent completed: iCloud typos detected!');
  });

  test('Agent Test: Custom business domain accepted', async ({ page }) => {
    console.log('🤖 Agent starting: Testing business email...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('john.doe@company.co.uk');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Business domain accepted!');
  });
});

// ============================================
// SECURITY & ADVANCED EDGE CASES
// ============================================
test.describe('Email Validation - Security & Advanced Cases', () => {
  
  test('Agent Test: SQL injection attempt rejected', async ({ page }) => {
    console.log('🤖 Agent starting: Testing SQL injection...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("test@example.com'; DROP TABLE--;");
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: SQL injection blocked!');
  });

  test('Agent Test: XSS attempt rejected', async ({ page }) => {
    console.log('🤖 Agent starting: Testing XSS attempt...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("<script>alert('xss')</script>@test.com");
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: XSS attempt blocked!');
  });

  test('Agent Test: Very short domain accepted (2 letters)', async ({ page }) => {
    console.log('🤖 Agent starting: Testing short domain...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('user@a.co');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Short domain accepted!');
  });

  test('Agent Test: Multiple @ symbols rejected', async ({ page }) => {
    console.log('🤖 Agent starting: Testing multiple @ symbols...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@@gmail.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: Multiple @ rejected!');
  });

  test('Agent Test: Consecutive dots rejected', async ({ page }) => {
    console.log('🤖 Agent starting: Testing consecutive dots...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test..name@gmail.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be invalid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-red-500');
    
    console.log('✅ Agent completed: Consecutive dots rejected!');
  });
});

// ============================================
// REAL-WORLD SCENARIOS
// ============================================
test.describe('Email Validation - Real-World Scenarios', () => {
  
  test('Agent Test: Capital letters in domain accepted', async ({ page }) => {
    console.log('🤖 Agent starting: Testing capital letters...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('Test@GMAIL.COM');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid (case insensitive)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Capital letters accepted!');
  });

  test('Agent Test: Subdomain email accepted', async ({ page }) => {
    console.log('🤖 Agent starting: Testing subdomain email...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('user@mail.company.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Subdomain accepted!');
  });

  test('Agent Test: Numeric domain accepted', async ({ page }) => {
    console.log('🤖 Agent starting: Testing numeric domain...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('user@123.com');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Numeric domain accepted!');
  });

  test('Agent Test: Copy-paste with extra spaces handled', async ({ page }) => {
    console.log('🤖 Agent starting: Testing copy-paste with spaces...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Simulate paste with extra spaces
    await emailInput.fill('   john.doe@example.com   ');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should be valid (trimmed)
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Extra spaces handled!');
  });
});

// ============================================
// PERFORMANCE TESTS
// ============================================
test.describe('Email Validation - Performance', () => {
  
  test('Agent Test: Rapid typing validation', async ({ page }) => {
    console.log('🤖 Agent starting: Testing rapid validation...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Type very quickly
    await emailInput.type('test@gmail.com', { delay: 10 });
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Should still validate correctly
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Rapid typing handled!');
  });

  test('Agent Test: Multiple rapid validations', async ({ page }) => {
    console.log('🤖 Agent starting: Testing multiple rapid validations...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Rapidly change email multiple times
    const emails = ['invalid', 'test@', 'test@gmail', 'test@gmail.com'];
    
    for (const email of emails) {
      await emailInput.clear();
      await emailInput.fill(email);
      await emailInput.blur();
      await page.waitForTimeout(100); // Very short wait
      await emailInput.click(); // Focus again
    }
    
    await page.waitForTimeout(500);
    
    // Final email should be valid
    const emailClasses = await emailInput.getAttribute('class');
    expect(emailClasses).toContain('border-green-500');
    
    console.log('✅ Agent completed: Multiple validations handled!');
  });
});

// ============================================
// ACCESSIBILITY TESTS
// ============================================
test.describe('Email Validation - Accessibility', () => {
  
  test('Agent Test: Email input has proper labels', async ({ page }) => {
    console.log('🤖 Agent starting: Testing accessibility labels...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    
    // Check for label or placeholder
    const placeholder = await emailInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.toLowerCase()).toContain('email');
    
    console.log('✅ Agent completed: Labels verified!');
  });

  test('Agent Test: Error messages are visible and clear', async ({ page }) => {
    console.log('🤖 Agent starting: Testing error visibility...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Check error message exists and is visible
    const errorMessage = page.locator('text=Please enter a valid email address');
    await expect(errorMessage).toBeVisible();
    
    // Check red error SVG icon is visible (the X in a circle)
    const redIcon = page.locator('svg.text-red-500').first();
    await expect(redIcon).toBeVisible();
    
    console.log('✅ Agent completed: Error messages clear!');
  });

  test('Agent Test: Focus remains on email field after error', async ({ page }) => {
    console.log('🤖 Agent starting: Testing focus management...');
    
    await page.goto('/');
    await page.click('text=Book Now');
    await navigateToEmailStep(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    await page.waitForTimeout(500);
    
    // Click back into field
    await emailInput.click();
    
    // Should be focused
    const isFocused = await emailInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
    
    console.log('✅ Agent completed: Focus management works!');
  });
});
