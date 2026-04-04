import { test, expect } from '@playwright/test';

// End-to-end checkout flow test suite for BuyingBuddy
// Run this periodically or before major deployments to ensure Stripe is functional.

test.describe('BuyingBuddy Checkout Flow', () => {
  test('Free Check to PPSR upgrade flow', async ({ page }) => {
    await page.goto('http://localhost:3000/check');
    
    // Fill out the free check form manually
    await page.fill('input#vehicle-make', 'Toyota');
    await page.fill('input#vehicle-model', 'Yaris');
    await page.fill('input#vehicle-year', '2019');
    await page.fill('input#vehicle-rego', '123ABC');
    await page.fill('input#asking-price', '15000');
    
    const email = `test-${Date.now()}@buyingbuddy.local`;
    await page.fill('input#check-email', email);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for result
    await expect(page.locator('text="Your snapshot"')).toBeVisible({ timeout: 15000 });
    
    // Click PPSR Upgrade
    // Find the PPSR button specifically by looking inside the PPSR card
    const ppsrCard = page.locator('article:has(h4:has-text("PPSR Report"))');
    await expect(ppsrCard).toBeVisible();
    
    const ppsrButton = ppsrCard.locator('button');
    
    // Intercept navigation to Stripe so we don't actually leave the app in basic tests
    const requestPromise = page.waitForRequest(req => req.url().includes('/api/stripe/checkout') && req.method() === 'POST');
    await ppsrButton.click();
    
    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || "{}");
    
    expect(postData.product).toBe("ppsr");
    // Verify it captured the rego correctly
    expect(postData.vehicle_identifier).toBe("123ABC");
  });

  test('Deal Room direct checkout flow', async ({ page }) => {
    await page.goto('http://localhost:3000/deal');
    
    // Wait for the Create Deal Room form
    const email = `deal-test-${Date.now()}@buyingbuddy.local`;
    await page.fill('input[name="buyer_email"]', email);
    
    // Click Create & Pay
    const createButton = page.locator('button:has-text("Create Deal Room & Pay")');
    await expect(createButton).toBeVisible();
    
    const requestPromise = page.waitForRequest(req => req.url().includes('/api/deal/create') && req.method() === 'POST');
    await createButton.click();
    
    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || "{}");
    
    expect(postData.buyer_email).toBe(email);
  });
});
