import { expect } from '@playwright/test';

export const STORAGE_KEY = 'lam_chu_ai_v1';

/**
 * Attach pageerror and console.error listeners for opaque-box runtime health checks.
 */
export function attachErrorListeners(page) {
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  return {
    pageErrors,
    consoleErrors,
    assertNoErrors() {
      expect(pageErrors, `Unexpected page errors: ${pageErrors.join('; ')}`).toEqual([]);
      expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toEqual([]);
    },
  };
}

/**
 * Grant clipboard permissions so Copy buttons can be verified against navigator.clipboard.
 */
export async function grantClipboard(context) {
  try {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  } catch {
    // Ignore if unsupported in a given browser context.
  }
}

/**
 * Navigate to the app and wait until the main heading is visible.
 */
export async function gotoApp(page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function readAppStorage(page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }, STORAGE_KEY);
}

export async function seedAppStorageBeforeLoad(page, value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  await page.addInitScript(
    ({ key, val }) => {
      window.localStorage.setItem(key, val);
    },
    { key: STORAGE_KEY, val: serialized }
  );
}

export async function clearAppStorage(page) {
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, STORAGE_KEY);
}

// --- Resilient Opaque-Box Locators ---

export function getTablist(page) {
  return page.getByRole('tablist').first();
}

export function getBasicTab(page) {
  return page.getByRole('tab', { name: /Cơ bản/i });
}

export function getAdvancedTab(page) {
  return page.getByRole('tab', { name: /Nâng cao/i });
}

export function getFontMediumButton(page) {
  return page.getByRole('button', { name: /^(?:cỡ chữ\s+)?vừa(?:\s*\([^)]*\))?$/i }).first();
}

export function getFontLargeButton(page) {
  return page.getByRole('button', { name: /^(?:cỡ chữ\s+)?lớn(?:\s*\([^)]*\))?$/i }).first();
}

export function getFontXLargeButton(page) {
  return page.getByRole('button', { name: /^(?:cỡ chữ\s+)?rất lớn(?:\s*\([^)]*\))?$/i }).first();
}

export function getContrastToggle(page) {
  return page
    .getByRole('button', { name: /Tương phản/i })
    .first();
}

export function getSearchInput(page) {
  return page
    .getByRole('searchbox')
    .or(page.getByPlaceholder(/Tìm|tìm kiếm|bạn muốn/i))
    .first();
}

export function getSearchRegion(page) {
  return page
    .getByRole('region', { name: /kết quả|tìm kiếm|mục tiêu/i })
    .or(page.getByRole('search'))
    .first();
}

export async function getBodyComputedFontSize(page) {
  return page.evaluate(() => parseFloat(window.getComputedStyle(document.body).fontSize));
}

export async function getBodyLineHeightRatio(page) {
  return page.evaluate(() => {
    const cs = window.getComputedStyle(document.body);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight);
    return Number.isFinite(lh) && fs > 0 ? lh / fs : 0;
  });
}

export async function getBodyColors(page) {
  return page.evaluate(() => {
    const cs = window.getComputedStyle(document.body);
    return {
      backgroundColor: cs.backgroundColor,
      color: cs.color,
    };
  });
}

/**
 * Read clipboard text when available. Note: in headless Chromium without active
 * document focus, navigator.clipboard.readText() may reject or return '' even
 * when writeText/execCommand succeeded, so callers should always assert the
 * visible "Đã sao chép" confirmation and live-region announcement unconditionally.
 */
export async function readClipboardText(page) {
  return page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return '';
    }
  });
}

/**
 * Locate Prompt Builder text inputs/textareas in the Basic tab by accessible label or placeholder.
 */
export function getPromptSlot(page, slotRegex) {
  return page
    .getByRole('textbox', { name: slotRegex })
    .or(page.getByPlaceholder(slotRegex))
    .first();
}

/**
 * Check horizontal overflow across the viewport.
 */
export async function getHorizontalOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
}
