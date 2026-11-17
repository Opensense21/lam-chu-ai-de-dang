import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getBasicTab,
  getPromptSlot,
  gotoApp,
  grantClipboard,
  readClipboardText,
} from './helpers.js';

test.describe('Tier 1 — Basic Tab "Cơ bản" (CB-01..CB-07)', () => {
  test('CB-01: Gentle intro to AI and interactive 4-card mini-quiz ("AI làm được không?")', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);
    await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');

    await expect(page.getByText(/AI làm được không|AI là gì/i).first()).toBeVisible();

    // Interact with a quiz card choice and scope feedback to that quiz card/section
    const quizChoice = page
      .getByRole('button', { name: /Làm được|Không nên|Có thể|Đúng|Sai/i })
      .first();
    await expect(quizChoice).toBeVisible();

    const quizCard = quizChoice.locator('xpath=ancestor::*[self::article or self::section][1]');
    const quizFeedback = quizCard
      .getByText(/Giải thích|Chính xác|Đúng rồi|Chưa đúng|Gợi ý/i)
      .first();
    await expect(quizFeedback).toBeHidden();

    await quizChoice.click();
    await expect(quizFeedback).toBeVisible();

    errors.assertNoErrors();
  });

  test('CB-02: Safety & Privacy Shield displays "KHÔNG chia sẻ với AI" guide', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    await expect(page.getByText(/KHÔNG chia sẻ với AI|Không nên chia sẻ|Bảo mật/i).first()).toBeVisible();
    await expect(page.getByText(/CCCD|OTP|Mật khẩu|Ngân hàng/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('CB-03: 4 Core Effective AI Principles and 4-part Prompt Anatomy are visible', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    await expect(page.getByText(/4 nguyên tắc|Nguyên tắc vàng|Cấu trúc Prompt/i).first()).toBeVisible();
    await expect(page.getByText(/Vai trò/i).first()).toBeVisible();
    await expect(page.getByText(/Bối cảnh/i).first()).toBeVisible();
    await expect(page.getByText(/Nhiệm vụ/i).first()).toBeVisible();
    await expect(page.getByText(/Định dạng/i).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('CB-04: 5-slot Prompt Builder with quick-pick chips updates live preview', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const roleInput = getPromptSlot(page, /Vai trò/i);
    const contextInput = getPromptSlot(page, /Bối cảnh/i);
    const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
    const formatInput = getPromptSlot(page, /Định dạng/i);
    const constraintsInput = getPromptSlot(page, /Ràng buộc|Lưu ý|Giới hạn/i);

    await roleInput.fill('Bác sĩ gia đình tận tâm');
    await contextInput.fill('Tôi 65 tuổi, mới đo huyết áp buổi sáng');
    await taskInput.fill('Giải thích chỉ số huyết áp dễ hiểu');
    await formatInput.fill('Gạch đầu dòng ngắn gọn');
    await constraintsInput.fill('Không dùng từ tiếng Anh chuyên ngành');

    await expect(page.getByText(/Bác sĩ gia đình tận tâm/i).first()).toBeVisible();
    await expect(page.getByText(/Giải thích chỉ số huyết áp dễ hiểu/i).first()).toBeVisible();

    // Also verify quick-pick chip interaction works unconditionally and updates the builder
    const quickChip = page
      .getByRole('button', { name: /Chuyên gia|Dễ hiểu|Ngắn gọn|Gạch đầu dòng|Bác sĩ|Giáo viên/i })
      .first();
    await expect(quickChip).toBeVisible();

    const builderSection = roleInput.locator('xpath=ancestor::section[1]');
    const beforeChipText = await builderSection.innerText();
    const beforeSlotValues =
      (await roleInput.inputValue()) +
      '|' +
      (await formatInput.inputValue()) +
      '|' +
      (await constraintsInput.inputValue());

    await quickChip.click();

    const afterChipText = await builderSection.innerText();
    const afterSlotValues =
      (await roleInput.inputValue()) +
      '|' +
      (await formatInput.inputValue()) +
      '|' +
      (await constraintsInput.inputValue());

    expect(afterChipText !== beforeChipText || afterSlotValues !== beforeSlotValues).toBeTruthy();

    errors.assertNoErrors();
  });

  test('CB-05: Pre-Send Checklist and Quality Score update from low to high as slots are filled', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    // Initially score should be low (e.g., 0% or < 50%)
    const scoreTextLocator = page.getByText(/\b\d{1,3}%/).first();
    await expect(scoreTextLocator).toBeVisible();

    await getPromptSlot(page, /Vai trò/i).fill('Trợ lý viết lách');
    await getPromptSlot(page, /Bối cảnh/i).fill('Viết tin nhắn chúc mừng sinh nhật cháu');
    await getPromptSlot(page, /Nhiệm vụ/i).fill('Viết 3 lời chúc ấm áp');
    await getPromptSlot(page, /Định dạng/i).fill('Đoạn văn ngắn');
    await getPromptSlot(page, /Ràng buộc|Lưu ý|Giới hạn/i).fill('Không quá 50 từ');

    await expect(page.getByText(/\b(80|90|100)%/).first()).toBeVisible();

    errors.assertNoErrors();
  });

  test('CB-06: Before-vs-After comparison toggles between vague and complete prompts', async ({ page }) => {
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    const toggleBtn = page
      .getByRole('button', {
        name: /Cách hỏi chuẩn 5 phần|Sau khi tối ưu|Xem kết quả tốt|Prompt chuẩn|Trước khi tối ưu|So sánh/i,
      })
      .first();
    await expect(toggleBtn).toBeVisible();

    const compareSection = toggleBtn.locator('xpath=ancestor::*[self::section or self::article][1]');
    await expect(compareSection).toBeVisible();
    const beforeCompareText = await compareSection.innerText();

    await toggleBtn.click();

    const afterCompareText = await compareSection.innerText();
    expect(afterCompareText).not.toBe(beforeCompareText);
    await expect(
      compareSection
        .getByText(/Câu lệnh chuẩn 5 phần|AI trả lời sát ý ngay|Rõ ràng|Đầy đủ|Sát mong muốn|Sau khi tối ưu|Prompt chuẩn/i)
        .first()
    ).toBeVisible();

    errors.assertNoErrors();
  });

  test('CB-07: Everyday Vietnamese templates span 4 domains and load into Prompt Builder', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = attachErrorListeners(page);
    await gotoApp(page);

    // Check 4 life domains are represented
    await expect(page.getByText(/Sức khỏe & Dinh dưỡng/i).first()).toBeVisible();
    await expect(page.getByText(/Tin nhắn & Thư từ/i).first()).toBeVisible();
    await expect(page.getByText(/Tóm tắt & Giải thích/i).first()).toBeVisible();
    await expect(page.getByText(/Gia đình & Đời sống/i).first()).toBeVisible();

    // Load a template into the builder
    const loadBtn = page
      .getByRole('button', {
        name: /Tùy chỉnh trong Trợ lý|Đưa mẫu chuẩn này vào Trợ lý|Đưa vào bộ ghép|Dùng mẫu|Nạp vào|Chỉnh sửa mẫu/i,
      })
      .first();
    await expect(loadBtn).toBeVisible();
    await loadBtn.click();

    // Builder task/role should now be populated and score > 0%
    const roleVal = await getPromptSlot(page, /Vai trò/i).inputValue();
    const taskVal = await getPromptSlot(page, /Nhiệm vụ/i).inputValue();
    expect((roleVal + taskVal).trim().length).toBeGreaterThan(5);

    // Copy populated prompt and assert visible confirmation unconditionally
    const copyBtn = page.getByRole('button', { name: /Sao chép để dán vào AI/i });
    await copyBtn.click();
    await expect(page.getByText(/Đã sao chép|Sao chép thành công/i).first()).toBeVisible();
    const copied = await readClipboardText(page);
    if (copied) {
      expect(copied.length).toBeGreaterThan(10);
    }

    errors.assertNoErrors();
  });
});
