import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBodyComputedFontSize,
  getContrastToggle,
  getFontXLargeButton,
  getPromptSlot,
  getSearchInput,
  gotoApp,
  grantClipboard,
  readClipboardText,
} from './helpers.js';

test.describe('Tier 4 — Realistic End-User Scenarios', () => {
  test('Scenario 1: Low-vision older adult adjusts display, takes mini-quiz, and builds a doctor-visit prompt', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    // 1. Adjust accessibility settings for low vision
    await getFontXLargeButton(page).click();
    await getContrastToggle(page).click();
    expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(24);

    // 2. Try mini-quiz (scoped to the quiz card so it cannot match static intro text)
    const quizChoice = page
      .getByRole('button', { name: /Làm được|Không nên|Có thể|Đúng|Sai/i })
      .first();
    const quizCard = quizChoice.locator('xpath=ancestor::*[self::article or self::section][1]');
    const quizFeedback = quizCard
      .getByText(/Giải thích|Chính xác|Đúng rồi|Chưa đúng|Gợi ý/i)
      .first();
    await expect(quizFeedback).toBeHidden();
    await quizChoice.click();
    await expect(quizFeedback).toBeVisible();

    // 3. Build a doctor-visit preparation prompt
    await getPromptSlot(page, /Vai trò/i).fill('Bác sĩ nội khoa kiên nhẫn');
    await getPromptSlot(page, /Bối cảnh/i).fill('Tôi 68 tuổi, chuẩn bị đi tái khám tiểu đường');
    await getPromptSlot(page, /Nhiệm vụ/i).fill('Liệt kê 5 câu hỏi quan trọng tôi nên hỏi bác sĩ');
    await getPromptSlot(page, /Định dạng/i).fill('Danh sách đánh số 1-5, chữ rõ ràng');
    await getPromptSlot(page, /Ràng buộc|Lưu ý|Giới hạn/i).fill('Không dùng thuật ngữ tiếng Anh');

    await expect(page.getByText(/\b(80|90|100)%/).first()).toBeVisible();

    // 4. Copy prompt
    await page.getByRole('button', { name: /Sao chép để dán vào AI/i }).click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    const copied = await readClipboardText(page);
    if (copied) {
      expect(copied).toMatch(/tái khám tiểu đường/i);
    }

    errors.assertNoErrors();
  });

  test('Scenario 2: Beginner triggers Privacy Guard with CCCD, corrects mistake, and copies safe prompt', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const contextInput = getPromptSlot(page, /Bối cảnh/i);
    const taskInput = getPromptSlot(page, /Nhiệm vụ/i);

    const warning = page.getByRole('alert').first();
    await expect(warning).toBeHidden();

    await taskInput.fill('Giúp tôi viết đơn xin xác nhận cư trú');
    await contextInput.fill('Họ tên Nguyễn Văn A, CCCD 079123456789');

    await expect(warning).toBeVisible();

    // User removes sensitive CCCD and replaces with safe placeholder
    await contextInput.fill('Họ tên [Họ tên], [Số giấy tờ - điền sau khi dán]');
    await expect(warning).toBeHidden();

    await page.getByRole('button', { name: /Sao chép để dán vào AI/i }).click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('Scenario 3: Busy beginner uses diacritic-free search, checks Before/After, loads template & copies', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const searchInput = getSearchInput(page);
    await searchInput.fill('cong viec');
    await expect(page.getByText(/Công việc|Email|Hành chính/i).first()).toBeVisible();

    // Inspect Before vs After
    const compareBtn = page
      .getByRole('button', {
        name: /Cách hỏi chuẩn 5 phần|Sau khi tối ưu|Xem kết quả tốt|Prompt chuẩn|So sánh/i,
      })
      .first();
    await compareBtn.click();

    // Load a template into builder and copy
    const loadBtn = page
      .getByRole('button', {
        name: /Tùy chỉnh trong Trợ lý|Đưa mẫu chuẩn này vào Trợ lý|Đưa vào bộ ghép|Dùng mẫu|Nạp vào|Chỉnh sửa mẫu/i,
      })
      .first();
    await loadBtn.click();

    await page.getByRole('button', { name: /Sao chép để dán vào AI/i }).click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('Scenario 4: Curious learner explores Advanced Glossary and steps through Simulator Permission Gate', async ({
    page,
  }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    // Open Glossary to check jargon
    const glossaryBtn = page.getByRole('button', { name: /Từ điển thuật ngữ AI/i });
    await glossaryBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Step through Simulator to Permission Gate and approve
    const stepBtn = page
      .getByRole('button', { name: /Bước tiếp|Chạy mô phỏng|Bắt đầu|Tiếp tục/i })
      .first();
    const approveBtn = page.getByRole('button', { name: /Cho phép|Đồng ý|Xác nhận|Approve/i }).first();

    for (let i = 0; i < 6; i++) {
      if (await approveBtn.isVisible().catch(() => false)) break;
      if (await stepBtn.isVisible().catch(() => false)) await stepBtn.click();
    }

    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
    await expect(
      page
        .getByRole('tabpanel', { name: /Nâng cao/i })
        .locator('#nc-02')
        .getByText(/Đã cấp quyền CHỈ ĐỌC|Hoàn thành|Đã phê duyệt|Thành công/i)
        .first()
    ).toBeVisible();

    errors.assertNoErrors();
  });

  test('Scenario 5: Power-curious user creates custom SKILL.md, inspects JSON/CLI, checks safety & copies', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await getAdvancedTab(page).click();

    const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });

    const skillModeBtn = advPanel.getByRole('button', { name: /SKILL\.md/i }).first();
    await skillModeBtn.click();

    const nameInput = advPanel
      .getByLabel(/Tên Skill|Tên kỹ năng|Tên quy trình/i)
      .or(advPanel.getByPlaceholder(/Tên Skill|ví dụ|tóm tắt/i))
      .first();
    await nameInput.fill('nhac-lich-kham-benh');

    // Expand collapsible technical config
    const techToggle = advPanel.getByText(/Xem cấu hình kỹ thuật/i).first();
    await techToggle.click();
    await expect(advPanel.getByText(/mcpServers|command|npx|json/i).first()).toBeVisible();

    // Verify Agent Safety section is visible
    await expect(advPanel.getByText(/Human-in-the-Loop|Con người duyệt|Chỉ đọc/i).first()).toBeVisible();

    // Copy SKILL.md output
    await advPanel.getByRole('button', { name: /^Sao chép$/i }).first().click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();

    errors.assertNoErrors();
  });
});
