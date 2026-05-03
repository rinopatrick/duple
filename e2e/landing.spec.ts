import { test, expect } from '@playwright/test';

test('shows app title and support links', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Duple', exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();

  await page.getByText('Support Us').click();

  await expect(page.getByText('☕ Ko-fi')).toBeVisible();
  await expect(page.getByText('☕ Ko-fi')).toHaveAttribute('href', 'https://ko-fi.com/rinopatrick');

  await expect(page.getByText('💰 Saweria')).toBeVisible();
  await expect(page.getByText('💰 Saweria')).toHaveAttribute('href', 'https://saweria.co/rinopatrick');

  await page.getByLabel('Close support menu').click();

  await expect(page.getByText('☕ Ko-fi')).not.toBeVisible();
});
