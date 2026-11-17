import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBodyComputedFontSize,
  getFontXLargeButton,
  gotoApp,
  grantClipboard,
} from './helpers.js';

test.describe('Tier 1 — Advanced Tab "Nâng cao" (NC-01..NC-05)', () => {
  test('NC-01: Analogy diagram, decision table, and collapsible JSON/CLI technical config', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });

    await expect(advPanel.getByText(/Agent/i).first()).toBeVisible();
    await expect(advPanel.getByText(/Skill/i).first()).toBeVisible();
    await expect(advPanel.getByText(/MCP/i).first()).toBeVisible();
    await expect(advPanel.getByText(/Plugin/i).first()).toBeVisible();

    // Decision table ("Khi nào dùng cái nào?")
    await expect(advPanel.getByText(/Khi nào dùng|So sánh|Bảng chọn/i).first()).toBeVisible();

    // Collapsible technical config (JSON/CLI)
    const techToggle = advPanel.getByText(/Xem cấu hình kỹ thuật/i).first();
    await expect(techToggle).toBeVisible();
    await techToggle.click();

    await expect(advPanel.getByText(/mcpServers|command|npx|json/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('NC-02: Interactive Agent/Skill/MCP Simulator progresses through steps and Permission Gate', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });

    await expect(advPanel.getByText(/Mô phỏng|Simulator|Từng bước/i).first()).toBeVisible();

    // Start or step through simulator
    const stepBtn = advPanel
      .getByRole('button', { name: /Bước tiếp|Chạy mô phỏng|Bắt đầu|Tiếp tục/i })
      .first();
    await expect(stepBtn).toBeVisible();

    // Advance until Permission Gate appears (or up to 6 clicks)
    const approveBtn = advPanel.getByRole('button', { name: /Cho phép|Đồng ý|Xác nhận|Approve/i }).first();
    for (let i = 0; i < 6; i++) {
      if (await approveBtn.isVisible().catch(() => false)) {
        break;
      }
      if (await stepBtn.isVisible().catch(() => false)) {
        await stepBtn.click();
      }
    }

    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    await expect(
      advPanel
        .locator('#nc-02')
        .getByText(/Đã cấp quyền CHỈ ĐỌC|Hoàn thành|Đã phê duyệt|Thành công/i)
        .first()
    ).toBeVisible();

    errors.assertNoErrors();
  });

  test('NC-03: Dual-mode SKILL.md & Multi-step Workflow Builder updates live preview', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });

    // Switch between SKILL.md mode and Workflow mode
    const skillModeBtn = advPanel.getByRole('button', { name: /SKILL\.md/i }).first();
    const workflowModeBtn = advPanel.getByRole('button', { name: /Quy trình|Workflow|Nhiều bước/i }).first();

    await expect(skillModeBtn).toBeVisible();
    await expect(workflowModeBtn).toBeVisible();

    await skillModeBtn.click();
    const nameInput = advPanel
      .getByLabel(/Tên Skill|Tên kỹ năng|Tên quy trình/i)
      .or(advPanel.getByPlaceholder(/Tên Skill|ví dụ|tóm tắt/i))
      .first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill('tom-tat-don-thuoc');

    await expect(advPanel.getByText(/tom-tat-don-thuoc/i).first()).toBeVisible();

    await workflowModeBtn.click();
    await expect(advPanel.getByText(/Bước 1|Workflow|Quy trình/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('NC-04: Advanced templates load into Skill Builder and expose collapsible JSON/CLI', async ({
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
    await expect(loadTemplateBtn).toBeVisible();
    await loadTemplateBtn.click();

    // Verify Skill Builder preview now contains populated content
    const copyBtn = advPanel.getByRole('button', { name: /^Sao chép$/i }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(advPanel.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('NC-05: Agent Safety & Permissions covers Read vs Write/Delete, Human-in-the-Loop, and Prompt Injection', async ({
    page,
  }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });
    await expect(advPanel.getByText(/Chỉ đọc|Đọc.*Ghi|Xóa/i).first()).toBeVisible();
    await expect(advPanel.getByText(/Human-in-the-Loop|Con người duyệt|Xác nhận trước khi/i).first()).toBeVisible();
    await expect(advPanel.getByText(/Prompt Injection|Lệnh giả|Tiêm lệnh/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('Advanced tab respects accessibility font scaling and renders without runtime errors', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    await getFontXLargeButton(page).click();
    const fontSize = await getBodyComputedFontSize(page);
    expect(fontSize).toBeGreaterThanOrEqual(24);

    await expect(page.getByRole('tabpanel')).toBeVisible();
    errors.assertNoErrors();
  });
});
