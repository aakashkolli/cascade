import { test, expect } from '@playwright/test';

test.describe('Cascade smoke tests', () => {
  test('loads and shows header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-header')).toBeVisible();
  });

  test('shows empty state before import', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/no tokens loaded/i)).toBeVisible();
  });

  test('can switch to Graph tab', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-graph').click();
    await expect(page.getByTestId('graph-view')).toBeVisible();
  });

  test('can switch to Audit tab', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-audit').click();
    await expect(page.getByTestId('audit-view')).toBeVisible();
  });

  test('audit shows WCAG compliant empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-audit').click();
    await expect(page.getByText(/no contrast violations/i)).toBeVisible();
  });
});
