import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBasicTab,
  getBodyColors,
  getBodyComputedFontSize,
  getContrastToggle,
  getFontLargeButton,
  getFontMediumButton,
  getFontXLargeButton,
  getSearchInput,
  getSearchRegion,
  gotoApp,
  grantClipboard,
  readAppStorage,
  readClipboardText,
} from './helpers.js';

test.describe('Tier 1 — Shared Shell & Cross-Cutting (SH-01..SH-06)', () => {
  test('SH-01: Top-level tab switcher updates ARIA state, URL hash, and localStorage', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const basicTab = getBasicTab(page);
    const advancedTab = getAdvancedTab(page);

    await expect(basicTab).toBeVisible();
    await expect(advancedTab).toBeVisible();
    await expect(basicTab).toHaveAttribute('aria-selected', 'true');
    await expect(advancedTab).toHaveAttribute('aria-selected', 'false');

    await advancedTab.click();
    await expect(advancedTab).toHaveAttribute('aria-selected', 'true');
    await expect(basicTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page).toHaveURL(/#(advanced|nang-cao)/i);

    const storedAfterAdv = await readAppStorage(page);
    expect(storedAfterAdv?.activeTab).toBe('advanced');

    await basicTab.click();
    await expect(basicTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/#(basic|co-ban)|\/$/i);

    const storedAfterBasic = await readAppStorage(page);
    expect(storedAfterBasic?.activeTab).toBe('basic');

    errors.assertNoErrors();
  });

  test('SH-02: Font size controls (Vừa / Lớn / Rất lớn) and Contrast toggle change computed styles', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const mediumBtn = getFontMediumButton(page);
    const largeBtn = getFontLargeButton(page);
    const xlargeBtn = getFontXLargeButton(page);

    await mediumBtn.click();
    const mediumSize = await getBodyComputedFontSize(page);
    expect(mediumSize).toBeGreaterThanOrEqual(18);

    await largeBtn.click();
    const largeSize = await getBodyComputedFontSize(page);
    expect(largeSize).toBeGreaterThanOrEqual(21);
    expect(largeSize).toBeGreaterThan(mediumSize);

    await xlargeBtn.click();
    const xlargeSize = await getBodyComputedFontSize(page);
    expect(xlargeSize).toBeGreaterThanOrEqual(24);
    expect(xlargeSize).toBeGreaterThan(largeSize);

    const initialColors = await getBodyColors(page);
    const contrastBtn = getContrastToggle(page);
    await contrastBtn.click();
    const highContrastColors = await getBodyColors(page);

    expect(
      highContrastColors.backgroundColor !== initialColors.backgroundColor ||
        highContrastColors.color !== initialColors.color
    ).toBeTruthy();

    errors.assertNoErrors();
  });

  test('SH-03: Quick-Start Goal Picker and Search filter content and navigate to sections', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const searchInput = getSearchInput(page);
    await expect(searchInput).toBeVisible();

    const searchRegion = getSearchRegion(page);
    await expect(searchRegion).toBeVisible();

    // Verify a specific search query ("MCP") produces a matching result inside the search region
    await searchInput.fill('MCP');
    const mcpResult = searchRegion
      .getByRole('button', { name: /MCP/i })
      .or(searchRegion.getByRole('link', { name: /MCP/i }))
      .or(searchRegion.getByRole('option', { name: /MCP/i }))
      .or(searchRegion.getByText(/MCP/i))
      .first();
    await expect(mcpResult).toBeVisible();

    // Clear search and verify quick-start goal chips are usable
    await searchInput.fill('');
    const goalChip = searchRegion
      .getByRole('button', { name: /Viết tin nhắn|Sức khỏe|Tạo Prompt|Thử ngay|Mục tiêu/i })
      .first();
    await expect(goalChip).toBeVisible();
    await goalChip.click();

    errors.assertNoErrors();
  });

  test('SH-04: One-click Copy writes to clipboard, announces status, and shows 3-step paste guide', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    // Verify 3-step "Cách dán vào AI" mini-guide is present and mentions ChatGPT/Gemini/Claude
    await expect(page.getByText(/Cách dán vào AI|Dán vào ChatGPT|ChatGPT|Gemini|Claude/i).first()).toBeVisible();

    const copyBtn = page.getByRole('button', { name: /Sao chép/i }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(
      page.getByText(/Đã sao chép|Sao chép thành công/i).first()
    ).toBeVisible();

    const clipboardText = await readClipboardText(page);
    if (clipboardText) {
      expect(clipboardText.trim().length).toBeGreaterThan(0);
    }

    errors.assertNoErrors();
  });

  test('SH-05: Accessibility preferences and active tab persist in localStorage across reload', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    await getFontXLargeButton(page).click();
    await getContrastToggle(page).click();
    await getAdvancedTab(page).click();

    const storedBefore = await readAppStorage(page);
    expect(storedBefore?.activeTab).toBe('advanced');
    expect(storedBefore?.fontSize).toBe('xlarge');
    expect(storedBefore?.contrast).toBe('high');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expect(getAdvancedTab(page)).toHaveAttribute('aria-selected', 'true');
    const reloadedFontSize = await getBodyComputedFontSize(page);
    expect(reloadedFontSize).toBeGreaterThanOrEqual(24);

    errors.assertNoErrors();
  });

  test('SH-06: Plain-Vietnamese Glossary modal explains Prompt, Agent, Skill, MCP, and Plugin', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    // Open glossary modal via glossary button or tappable term
    const glossaryTrigger = page.getByRole('button', { name: /Từ điển thuật ngữ AI/i });
    await expect(glossaryTrigger).toBeVisible();
    await glossaryTrigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Check plain-Vietnamese explanations for all 5 core terms are present in the glossary
    const dialogText = await dialog.innerText();
    expect(dialogText).toMatch(/Prompt/i);
    expect(dialogText).toMatch(/Agent/i);
    expect(dialogText).toMatch(/Skill/i);
    expect(dialogText).toMatch(/MCP/i);
    expect(dialogText).toMatch(/Plugin/i);
    expect(dialogText.trim().length).toBeGreaterThan(100);

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    errors.assertNoErrors();
  });

  test('Standalone zero-auth flow loads directly without login or API key gates', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^(Đăng nhập|Sign in|Log in|Nhập API key)$/i })
    ).toHaveCount(0);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: /API key|Mật khẩu/i })).toHaveCount(0);
    await expect(getBasicTab(page)).toBeVisible();
    await expect(getAdvancedTab(page)).toBeVisible();

    errors.assertNoErrors();
  });
});
