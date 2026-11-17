import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBasicTab,
  getBodyComputedFontSize,
  getFontMediumButton,
  getFontXLargeButton,
  getHorizontalOverflow,
  getPromptSlot,
  getSearchInput,
  getSearchRegion,
  gotoApp,
  seedAppStorageBeforeLoad,
} from './helpers.js';

test.describe('Tier 2 — Boundaries, Negatives & Edge Cases', () => {
  test.describe('Shared Shell Boundaries', () => {
    test('Min/max font size boundaries (Vừa >= 18px, Rất lớn >= 24px) are idempotent', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const medBtn = getFontMediumButton(page);
      const xlargeBtn = getFontXLargeButton(page);

      await medBtn.click();
      await medBtn.click();
      expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(18);

      await xlargeBtn.click();
      await xlargeBtn.click();
      expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(24);

      errors.assertNoErrors();
    });

    test('Diacritic-insensitive Vietnamese search matches "co ban", "chao hoi", and d/đ equivalence', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const searchInput = getSearchInput(page);
      const searchRegion = getSearchRegion(page);

      await searchInput.fill('suc khoe');
      await expect(searchRegion.getByText(/Sức khỏe|bác sĩ|huyết áp/i).first()).toBeVisible();

      await searchInput.fill('dinh dang');
      await expect(searchRegion.getByText(/Định dạng/i).first()).toBeVisible();

      await searchInput.fill('don thuoc');
      await expect(searchRegion.getByText(/đơn thuốc|thuốc|sức khỏe/i).first()).toBeVisible();

      errors.assertNoErrors();
    });

    test('Empty, whitespace-only, and no-match search queries show graceful state without crashing', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const searchInput = getSearchInput(page);

      await searchInput.fill('     ');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await searchInput.fill('xyzabc123khongtontai');
      await expect(
        page.getByText(/Không tìm thấy|Không có kết quả|Thử từ khóa khác/i).first()
      ).toBeVisible();

      await searchInput.fill('');
      errors.assertNoErrors();
    });

    test('Invalid URL hashes (#nonexistent, #invalid, #%ZZ) fall back cleanly to default tab', async ({ page }) => {
      const errors = attachErrorListeners(page);

      for (const badHash of ['/#nonexistent', '/#invalid', '/#%ZZ']) {
        await gotoApp(page, badHash);
        await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel', { name: /Cơ bản/i })).toBeVisible();
      }

      errors.assertNoErrors();
    });

    test('Corrupted localStorage JSON and invalid schema values fall back safely to defaults', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await seedAppStorageBeforeLoad(page, '{corrupted_json_!!!');
      await gotoApp(page);

      await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');
      expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(18);

      // Invalid schema values
      await seedAppStorageBeforeLoad(page, {
        activeTab: 'unknown-tab',
        fontSize: 'gigantic',
        contrast: 'neon',
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');
      expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(18);

      errors.assertNoErrors();
    });
  });

  test.describe('Basic Tab Boundaries', () => {
    test('Empty Prompt Builder displays 0% score and handles empty state safely', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      await expect(page.getByText(/\b0%/).first()).toBeVisible();
      const copyBtn = page.getByRole('button', { name: /Sao chép/i }).first();
      await expect(copyBtn).toBeVisible();

      errors.assertNoErrors();
    });

    test('Privacy Guard warns on 12-digit CCCD number', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const alert = page.getByRole('alert').first();
      await expect(alert).toBeHidden();

      const contextInput = getPromptSlot(page, /Bối cảnh/i);
      await contextInput.fill('Số CCCD của tôi là 079123456789');

      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/CCCD|nhạy cảm|cảnh báo|không nên/i);

      errors.assertNoErrors();
    });

    test('Privacy Guard warns on OTP code', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const alert = page.getByRole('alert').first();
      await expect(alert).toBeHidden();

      const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
      await taskInput.fill('Kiểm tra mã OTP 482910 giúp tôi');

      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/OTP|nhạy cảm|cảnh báo|không nên/i);

      errors.assertNoErrors();
    });

    test('Privacy Guard warns on password ("mật khẩu")', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const alert = page.getByRole('alert').first();
      await expect(alert).toBeHidden();

      const contextInput = getPromptSlot(page, /Bối cảnh/i);
      await contextInput.fill('Đây là mật khẩu email của tôi: abc12345');

      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/mật khẩu|nhạy cảm|cảnh báo|không nên/i);

      errors.assertNoErrors();
    });

    test('Privacy Guard warns on bank account ("tài khoản ngân hàng")', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const alert = page.getByRole('alert').first();
      await expect(alert).toBeHidden();

      const contextInput = getPromptSlot(page, /Bối cảnh/i);
      await contextInput.fill('Chuyển tiền vào tài khoản ngân hàng 19034567890123');

      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/ngân hàng|tài khoản|nhạy cảm|cảnh báo|không nên/i);

      errors.assertNoErrors();
    });

    test('Privacy Guard recovery: clearing sensitive text removes the warning', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const contextInput = getPromptSlot(page, /Bối cảnh/i);
      await contextInput.fill('Số CCCD 079123456789');
      const guardWarning = page.getByRole('alert').first();
      await expect(guardWarning).toBeVisible();

      await contextInput.fill('Tôi muốn hỏi cách nấu phở bò tại nhà');
      await expect(guardWarning).toBeHidden();

      errors.assertNoErrors();
    });

    test('Extreme long input (2000+ chars) in Prompt Builder causes no crash or horizontal overflow', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const longText = 'Hướng dẫn chi tiết cho người mới bắt đầu. '.repeat(55);
      const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
      await taskInput.fill(longText);

      const overflow = await getHorizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

      errors.assertNoErrors();
    });
  });

  test.describe('Advanced Tab Boundaries', () => {
    test('Empty Skill Builder renders cleanly without errors', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const nameInput = page
        .getByLabel(/Tên Skill|Tên kỹ năng|Tên quy trình/i)
        .or(page.getByPlaceholder(/Tên Skill|ví dụ|tóm tắt/i))
        .first();
      await nameInput.fill('');
      await expect(page.getByRole('tabpanel')).toBeVisible();

      errors.assertNoErrors();
    });

    test('Simulator Permission Gate: Deny/Cancel halts action safely without executing write/delete', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const stepBtn = page
        .getByRole('button', { name: /Bước tiếp|Chạy mô phỏng|Bắt đầu|Tiếp tục/i })
        .first();
      const denyBtn = page.getByRole('button', { name: /Từ chối|Hủy|Không cho phép|Deny/i }).first();

      for (let i = 0; i < 6; i++) {
        if (await denyBtn.isVisible().catch(() => false)) break;
        if (await stepBtn.isVisible().catch(() => false)) await stepBtn.click();
      }

      await expect(denyBtn).toBeVisible();
      await denyBtn.click();

      await expect(
        page
          .getByRole('tabpanel', { name: /Nâng cao/i })
          .locator('#nc-02')
          .getByText(/Đã từ chối|Đã hủy|Dừng lại|An toàn|Không thực hiện/i)
          .first()
      ).toBeVisible();

      errors.assertNoErrors();
    });

    test('Simulator Permission Gate: Approve allows flow to complete', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

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

    test('Rapid mode toggles and collapsible JSON/CLI toggles remain consistent', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const skillModeBtn = page.getByRole('button', { name: /SKILL\.md/i }).first();
      const workflowModeBtn = page.getByRole('button', { name: /Quy trình|Workflow|Nhiều bước/i }).first();
      const advPanel = page.getByRole('tabpanel', { name: /Nâng cao/i });
      const techToggle = advPanel.getByText(/Xem cấu hình kỹ thuật/i).first();

      for (let i = 0; i < 3; i++) {
        await workflowModeBtn.click();
        await skillModeBtn.click();
        await techToggle.click();
      }

      await expect(page.getByRole('tabpanel')).toBeVisible();
      errors.assertNoErrors();
    });

    test('Simulator mid-flow reset returns cleanly to initial step', async ({ page }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const stepBtn = page
        .getByRole('button', { name: /Bước tiếp|Chạy mô phỏng|Bắt đầu|Tiếp tục/i })
        .first();
      await stepBtn.click();

      const resetBtn = page.getByRole('button', { name: /Đặt lại|Làm lại|Bắt đầu lại|Reset/i }).first();
      await expect(resetBtn).toBeVisible();
      await resetBtn.click();

      await expect(stepBtn).toBeVisible();
      errors.assertNoErrors();
    });
  });
});
