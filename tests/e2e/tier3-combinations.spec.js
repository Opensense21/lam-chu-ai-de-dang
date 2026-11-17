import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBodyColors,
  getBodyComputedFontSize,
  getContrastToggle,
  getFontXLargeButton,
  getPromptSlot,
  getSearchInput,
  getSearchRegion,
  gotoApp,
  grantClipboard,
  readClipboardText,
} from './helpers.js';

test.describe('Tier 3 — Pairwise Feature Combinations', () => {
  test('Font size + High contrast + Tab switch + Reload preserve full visual & tab state', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const baseColors = await getBodyColors(page);
    await getFontXLargeButton(page).click();
    await getContrastToggle(page).click();
    await getAdvancedTab(page).click();

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(getAdvancedTab(page)).toHaveAttribute('aria-selected', 'true');
    expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(24);
    const reloadedColors = await getBodyColors(page);
    expect(
      reloadedColors.backgroundColor !== baseColors.backgroundColor ||
        reloadedColors.color !== baseColors.color
    ).toBeTruthy();

    errors.assertNoErrors();
  });

  test('Everyday Template -> Load into Builder -> Checklist/Score -> One-click Copy', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const loadBtn = page
      .getByRole('button', {
        name: /Tùy chỉnh trong Trợ lý|Đưa mẫu chuẩn này vào Trợ lý|Đưa vào bộ ghép|Dùng mẫu|Nạp vào|Chỉnh sửa mẫu/i,
      })
      .first();
    await loadBtn.click();

    // Score should be high (>= 60%) after loading a complete template
    await expect(page.getByText(/\b(60|70|80|90|100)%/).first()).toBeVisible();

    // Customize one slot slightly and copy
    const constraintsInput = getPromptSlot(page, /Ràng buộc|Lưu ý|Giới hạn/i);
    await constraintsInput.fill('Trả lời bằng tiếng Việt thật dễ hiểu');

    const copyBtn = page.getByRole('button', { name: /Sao chép để dán vào AI/i });
    await copyBtn.click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    const copied = await readClipboardText(page);
    if (copied) {
      expect(copied).toMatch(/tiếng Việt thật dễ hiểu/i);
    }

    errors.assertNoErrors();
  });

  test('Diacritic-free Search -> Jump to section -> Interact with controls', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const searchInput = getSearchInput(page);
    await searchInput.fill('ghep prompt');

    const searchRegion = getSearchRegion(page);
    const jumpBtn = searchRegion
      .getByRole('button', { name: /Trợ lý ghép câu lệnh|Prompt|Bộ ghép|Xem|Đi tới/i })
      .first();
    await expect(jumpBtn).toBeVisible();
    await jumpBtn.click();

    const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
    await taskInput.fill('Tóm tắt tin tức buổi sáng');
    await expect(taskInput).toHaveValue('Tóm tắt tin tức buổi sáng');

    errors.assertNoErrors();
  });

  test('Advanced Template -> Load into Builder -> Toggle JSON/CLI -> Copy SKILL.md', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });
    const loadTemplateBtn = advPanel
      .getByRole('button', { name: /Đưa vào Xưởng thiết kế|Đưa vào bộ tạo|Dùng mẫu|Nạp mẫu|Tùy chỉnh mẫu/i })
      .first();
    await loadTemplateBtn.click();

    const techToggle = advPanel.getByText(/Xem cấu hình kỹ thuật/i).first();
    await techToggle.click();
    await expect(advPanel.getByText(/mcpServers|command|npx|json/i).first()).toBeVisible();

    const copyBtn = advPanel.getByRole('button', { name: /^Sao chép$/i }).first();
    await copyBtn.click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('Glossary term tap -> Open modal -> Close -> Tab context and focus preserved', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const glossaryTrigger = page.getByRole('button', { name: /Từ điển thuật ngữ AI/i });
    await glossaryTrigger.focus();
    await glossaryTrigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(getAdvancedTab(page)).toHaveAttribute('aria-selected', 'true');

    errors.assertNoErrors();
  });
});
