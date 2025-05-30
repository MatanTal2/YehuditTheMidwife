import { test, expect } from '@playwright/test';

test('homepage has expected title and login link', async ({ page }) => {
  await page.goto('/'); // Go to the baseURL (http://localhost:3000)
  
  // Check the title - this should match what's in layout.tsx
  // The subtask mentioned ensuring this matches. The current title in layout.tsx is "Next.js Firebase Auth Demo"
  await expect(page).toHaveTitle(/Next.js Firebase Auth Demo/); 

  // Find the "Login" link. The AuthStatus component renders this.
  const loginLink = page.getByRole('link', { name: /Login/i });
  await expect(loginLink).toBeVisible();
  
  // Additionally, let's check for the "Register" link
  const registerLink = page.getByRole('link', { name: /Register/i });
  await expect(registerLink).toBeVisible();
});

test('navigation to login page works', async ({ page }) => {
  await page.goto('/');
  
  const loginLink = page.getByRole('link', { name: /Login/i });
  await loginLink.click();
  
  // After clicking, we should be on the login page
  // Check for a heading or a unique element on the login page
  await expect(page.getByRole('heading', { name: 'Login to your Account' })).toBeVisible();
  await expect(page).toHaveURL(/.*\/login/); // Check if URL is correct
});
