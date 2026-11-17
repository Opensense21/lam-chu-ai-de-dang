import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBasicTab,
  getBodyComputedFontSize,
  getBodyLineHeightRatio,
  getFontLargeButton,
  getFontMediumButton,
  getFontXLargeButton,
  getHorizontalOverflow,
  gotoApp,
} from './helpers.js';

test.describe('Accessibility & Responsive Layout', () => {
  test('Document has lang="vi", single h1, and readable body font-size & line-height', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toMatch(/^vi(-VN)?$/i);

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    await getFontMediumButton(page).click();
    expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(18);
    expect(await getBodyLineHeightRatio(page)).toBeGreaterThanOrEqual(1.5);

    await getFontLargeButton(page).click();
    expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(21);

    await getFontXLargeButton(page).click();
    expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(24);
    expect(await getBodyLineHeightRatio(page)).toBeGreaterThanOrEqual(1.5);

    errors.assertNoErrors();
  });

  test('Visible interactive buttons and tabs meet >= 48px touch target requirement across both tabs', async ({
    page,
  }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const checkTargets = async (tabLabel) => {
      const failures = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('button, [role="tab"]'));
        const bad = [];
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
            continue;
          }
          if (rect.height < 48 || rect.width < 48) {
            bad.push({
              text: (el.textContent || '').trim().slice(0, 40),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }
        return bad;
      });
      expect(
        failures,
        `Touch target < 48px on ${tabLabel}: ${JSON.stringify(failures)}`
      ).toEqual([]);
    };

    await checkTargets('Basic tab');
    await getAdvancedTab(page).click();
    await checkTargets('Advanced tab');

    errors.assertNoErrors();
  });

  test('Keyboard navigation: Tablist ArrowLeft/ArrowRight and Glossary Escape', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const basicTab = getBasicTab(page);
    const advancedTab = getAdvancedTab(page);

    await basicTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(advancedTab).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('ArrowLeft');
    await expect(basicTab).toHaveAttribute('aria-selected', 'true');

    // Tab forward to verify focus moves cleanly
    await page.keyboard.press('Tab');
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBeTruthy();

    // Open glossary modal and close with Escape
    const glossaryBtn = page.getByRole('button', { name: /Từ điển thuật ngữ AI/i });
    await glossaryBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    errors.assertNoErrors();
  });

  test('Zero horizontal overflow on 375x812 mobile and 1280x800 desktop across both tabs at Rất lớn font size', async ({
    page,
  }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getFontXLargeButton(page).click();

    for (const vp of [
      { width: 375, height: 812 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);

      await getBasicTab(page).click();
      const basicOverflow = await getHorizontalOverflow(page);
      expect(
        basicOverflow.scrollWidth,
        `Horizontal overflow on Basic tab at ${vp.width}x${vp.height}`
      ).toBeLessThanOrEqual(basicOverflow.innerWidth);

      await getAdvancedTab(page).click();
      const advOverflow = await getHorizontalOverflow(page);
      expect(
        advOverflow.scrollWidth,
        `Horizontal overflow on Advanced tab at ${vp.width}x${vp.height}`
      ).toBeLessThanOrEqual(advOverflow.innerWidth);
    }

    errors.assertNoErrors();
  });
});
