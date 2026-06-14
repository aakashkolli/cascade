import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

test.describe('Accessibility audit', () => {
  test('tokens view has zero axe violations', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    const violations = await getViolations(page);
    if (violations.length > 0) {
      console.log(JSON.stringify(violations, null, 2));
    }
    expect(violations).toEqual([]);
  });

  test('graph view has zero axe violations', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-graph').click();
    await page.waitForTimeout(500); // allow graph to settle
    await injectAxe(page);
    const violations = await getViolations(page);
    if (violations.length > 0) {
      console.log(JSON.stringify(violations, null, 2));
    }
    expect(violations).toEqual([]);
  });

  test('audit view has zero axe violations', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-audit').click();
    await injectAxe(page);
    const violations = await getViolations(page);
    if (violations.length > 0) {
      console.log(JSON.stringify(violations, null, 2));
    }
    expect(violations).toEqual([]);
  });
});
