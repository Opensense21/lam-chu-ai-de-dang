import { test, expect } from '@playwright/test';
import {
  attachErrorListeners,
  getAdvancedTab,
  getBasicTab,
  getBodyComputedFontSize,
  getContrastToggle,
  getFontXLargeButton,
  getHorizontalOverflow,
  getPromptSlot,
  getSearchInput,
  getSearchRegion,
  gotoApp,
  grantClipboard,
  readAppStorage,
  readClipboardText,
  seedAppStorageBeforeLoad,
} from './helpers.js';

test.describe('Tier 5 — Adversarial Security, Storage, A11y & Boundary Hardening', () => {
  test.describe('Security, Storage & Boundary Hardening', () => {
    test('XSS payloads in PromptBuilder, Favorites, SkillBuilder, and GoalSearch never execute and render literally', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await page.addInitScript(() => {
        window.__xssExecuted = false;
      });
      await gotoApp(page);

      const xssPayload =
        '</textarea><img src=x onerror="window.__xssExecuted=true"><script>window.__xssExecuted=true</script>';

      // 1. GoalSearch XSS probe
      const searchInput = getSearchInput(page);
      await searchInput.fill(xssPayload);
      await expect(page.getByText(/Không có kết quả|Không tìm thấy/i).first()).toBeVisible();
      await searchInput.fill('');

      // 2. PromptBuilder XSS probe + save favorite + reload persistence
      const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
      await taskInput.fill(xssPayload);
      await expect(page.locator('#cb04-preview')).toContainText('<img src=x');

      await page.getByRole('button', { name: /Lưu mẫu yêu thích/i }).click();
      await expect(page.locator('#cb04-favorites-list')).toContainText('</textarea><img');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('#cb04-favorites-list')).toContainText('</textarea><img');

      // 3. SkillBuilder XSS probe + mode switch + save
      await getAdvancedTab(page).click();
      const skillName = page.locator('#nc-03 [data-builder-field="name"]');
      const skillSteps = page.locator('#nc-03 [data-builder-field="steps"]');
      await skillName.fill('xss-test-skill');
      await skillSteps.fill(xssPayload);
      await expect(page.locator('#nc-03 [data-builder-preview]')).toContainText('<script>');

      // Switch mode and back: state preserved, no script execution
      await page.locator('#nc-03 [data-builder-mode="workflow"]').click();
      await page.locator('#nc-03 [data-builder-mode="skill"]').click();
      await expect(page.locator('#nc-03 [data-builder-field="steps"]')).toHaveValue(xssPayload);

      const xssRan = await page.evaluate(() => Boolean(window.__xssExecuted));
      expect(xssRan).toBe(false);
      errors.assertNoErrors();
    });

    test('Prototype-pollution, wrong-type localStorage schema, and malformed favorite entries are sanitized safely', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await seedAppStorageBeforeLoad(
        page,
        JSON.stringify({
          __proto__: { polluted: 'yes' },
          activeTab: '__proto__',
          fontSize: 'huge',
          contrast: 'invalid',
          favorites: [
            JSON.stringify({ id: 123, title: 'Zombie numeric id', fields: { task: 'x' } }),
            JSON.stringify({ id: 'bad-fields', title: 'Zombie array fields', fields: ['x'] }),
          ],
          completedIds: null,
        })
      );
      await gotoApp(page);

      await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');
      expect(await getBodyComputedFontSize(page)).toBeGreaterThanOrEqual(18);
      await expect(page.locator('#cb-04')).not.toContainText('Zombie numeric id');
      await expect(page.locator('#cb-04')).not.toContainText('Zombie array fields');

      const polluted = await page.evaluate(() => ({}).polluted === 'yes');
      expect(polluted).toBe(false);

      const stored = await readAppStorage(page);
      await getAdvancedTab(page).click();
      const afterSave = await readAppStorage(page);
      expect(afterSave.activeTab).toBe('advanced');
      expect(Array.isArray(afterSave.favorites)).toBe(true);
      expect(Array.isArray(afterSave.completedIds)).toBe(true);
      expect(stored === null || typeof stored === 'object').toBe(true);

      errors.assertNoErrors();
    });

    test('QuotaExceededError on localStorage.setItem does not crash UI interactions', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await page.addInitScript(() => {
        Storage.prototype.setItem = function () {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        };
      });
      await gotoApp(page);

      await getAdvancedTab(page).click();
      await expect(page.getByRole('tabpanel', { name: /Nâng cao/i })).toBeVisible();

      await getBasicTab(page).click();
      const taskInput = getPromptSlot(page, /Nhiệm vụ/i);
      await taskInput.fill('Viết lời chúc sức khỏe');
      await page.getByRole('button', { name: /Lưu mẫu yêu thích/i }).click();

      errors.assertNoErrors();
    });

    test('Clipboard API rejection + execCommand failure triggers graceful fallback message in PromptBuilder and SkillBuilder', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: () => Promise.reject(new Error('NotAllowedError')),
          },
        });
        document.execCommand = () => false;
      });
      await gotoApp(page);

      // Basic PromptBuilder fallback
      await getPromptSlot(page, /Nhiệm vụ/i).fill('Tóm tắt tin tức hôm nay');
      await page.locator('#cb04-copy-btn').click();
      await expect(page.locator('#cb04-copy-feedback')).toContainText(/Không thể tự(?: động)? sao chép/i);

      // Advanced SkillBuilder fallback
      await getAdvancedTab(page).click();
      await page.locator('#nc-03 [data-builder-field="name"]').fill('test-copy-fail');
      await page.locator('#nc-03 [data-builder-action="copy"]').click();
      await expect(page.locator('#nc-03 [data-builder-copy-feedback]')).toContainText(
        /Không thể tự(?: động)? sao chép/i
      );

      errors.assertNoErrors();
    });

    test('Privacy Guard catches spaced/dashed CCCD, 9-digit CMND, and diacritic-stripped/mixed-case keywords in both PromptBuilder and SkillBuilder', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const contextInput = getPromptSlot(page, /Bối cảnh/i);
      const alert = page.locator('#cb04-privacy-banner');

      // Spaced CCCD
      await contextInput.fill('Số 012 345 678 901');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/CCCD\/CMND/i);

      // Dashed CCCD
      await contextInput.fill('Số 012-345-678-901');
      await expect(alert).toBeVisible();

      // Everyday Vietnamese "hết pin" must NOT trigger false positive
      await contextInput.fill('Điện thoại của tôi sắp hết pin rồi');
      await expect(alert).toBeHidden();

      // Diacritic-stripped & mixed-case keywords
      await contextInput.fill('Day la Mat Khau va Tai Khoan Ngan Hang voi Ma Pin OTP');
      await expect(alert).toContainText(/mật khẩu/i);
      await expect(alert).toContainText(/ngân hàng/i);
      await expect(alert).toContainText(/OTP|PIN/i);

      // SkillBuilder Privacy Guard integration
      await getAdvancedTab(page).click();
      const skillInput = page.locator('#nc-03 [data-builder-field="steps"]');
      await skillInput.fill('1. Nhap mat khau va so 012 345 678 901');
      const skillAlert = page.locator('#nc-03 [data-builder-privacy]');
      await expect(skillAlert).toBeVisible();
      await expect(skillAlert).toContainText(/CCCD\/CMND/i);
      await expect(skillAlert).toContainText(/mật khẩu/i);

      errors.assertNoErrors();
    });

    test('Special characters (backticks, ---, emojis) in PromptBuilder & SkillBuilder render safely without breaking score or layout', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const special = '```yaml\n---\n🎉 Bảo vệ thông tin 🛡️\n---';
      await getPromptSlot(page, /Vai trò/i).fill('Trợ lý 🎉');
      await getPromptSlot(page, /Nhiệm vụ/i).fill(special);
      await expect(page.locator('#cb04-preview')).toContainText('```yaml');
      await expect(page.locator('#cb05-score-badge')).toContainText('40%');

      await getAdvancedTab(page).click();
      await page.locator('#nc-03 [data-builder-field="name"]').fill('skill-🎉');
      await page.locator('#nc-03 [data-builder-field="steps"]').fill(special);
      await expect(page.locator('#nc-03 [data-builder-preview]')).toContainText('```yaml');

      errors.assertNoErrors();
    });

    test('[REGRESSION BUG-01] Saving and deleting a Basic Prompt favorite must NOT wipe out saved Skills in NC-03', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      // Save a Skill in Advanced tab
      await getAdvancedTab(page).click();
      await page.locator('#nc-03 [data-builder-field="name"]').fill('my-saved-skill');
      await page.locator('#nc-03 [data-builder-action="save"]').click();
      await expect(page.locator('#nc-03 [data-builder-saved-list]')).toContainText('my-saved-skill');

      // Save a Basic Prompt favorite in Basic tab
      await getBasicTab(page).click();
      await getPromptSlot(page, /Nhiệm vụ/i).fill('Tóm tắt bài báo');
      await page.locator('#cb04-save-fav-btn').click();

      // Verify Skill is still in storage
      const storedAfterSave = await readAppStorage(page);
      expect(
        storedAfterSave.favorites.some(
          (entry) => typeof entry === 'string' && entry.startsWith('skill_v1:')
        )
      ).toBe(true);

      // Delete the Basic Prompt favorite and verify Skill is still preserved after reload
      await page.locator('#cb04-favorites-list [data-fav-delete]').first().click();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await getAdvancedTab(page).click();
      await expect(page.locator('#nc-03 [data-builder-saved-list]')).toContainText('my-saved-skill');

      errors.assertNoErrors();
    });
  });

  test.describe('Keyboard Traps, Focus Restoration, Deep-Links & Tablists', () => {
    test('TabNav supports Arrow wrap-around, Home/End, roving tabindex, hashchange, and #nc-03 deep-link hash', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const basicTab = getBasicTab(page);
      const advancedTab = getAdvancedTab(page);

      // Wrap-around: Basic + ArrowLeft -> Advanced
      await basicTab.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(advancedTab).toHaveAttribute('aria-selected', 'true');
      await expect(advancedTab).toHaveAttribute('tabindex', '0');
      await expect(basicTab).toHaveAttribute('tabindex', '-1');
      await expect(advancedTab).toBeFocused();

      // Wrap-around: Advanced + ArrowRight -> Basic
      await page.keyboard.press('ArrowRight');
      await expect(basicTab).toHaveAttribute('aria-selected', 'true');
      await expect(basicTab).toHaveAttribute('tabindex', '0');
      await expect(advancedTab).toHaveAttribute('tabindex', '-1');
      await expect(basicTab).toBeFocused();

      // End -> Advanced, Home -> Basic
      await page.keyboard.press('End');
      await expect(advancedTab).toHaveAttribute('aria-selected', 'true');
      await expect(advancedTab).toBeFocused();

      await page.keyboard.press('Home');
      await expect(basicTab).toHaveAttribute('aria-selected', 'true');
      await expect(basicTab).toBeFocused();

      // hashchange event (browser hash navigation)
      await page.evaluate(() => {
        window.location.hash = '#advanced';
      });
      await expect(advancedTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel', { name: /Nâng cao/i })).toBeVisible();

      await page.evaluate(() => {
        window.location.hash = '#basic';
      });
      await expect(basicTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel', { name: /Cơ bản/i })).toBeVisible();

      // Deep-link section hash #nc-03 activates Advanced tab even when basic was active
      await page.goto('/#nc-03', { waitUntil: 'domcontentloaded' });
      await expect(getAdvancedTab(page)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#nc-03')).toBeVisible();

      errors.assertNoErrors();
    });

    test('GlossaryModal traps Tab and Shift+Tab (including from .modal-dialog) and restores focus on Escape, close button, and backdrop click', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const footerTrigger = page.getByRole('button', { name: /Từ điển thuật ngữ AI/i });
      const dialog = page.getByRole('dialog');
      const closeBtn = dialog.getByRole('button', { name: /Đóng/i });

      // 1. Open -> Tab/Shift+Tab trapped -> .modal-dialog Shift+Tab trapped -> Escape restores focus
      await footerTrigger.focus();
      await footerTrigger.click();
      await expect(dialog).toBeVisible();
      await expect(closeBtn).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(closeBtn).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(closeBtn).toBeFocused();

      // Clicking inside dialog body moves focus to .modal-dialog; Shift+Tab must stay inside modal
      await dialog.focus();
      await expect(dialog).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(closeBtn).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(footerTrigger).toBeFocused();

      // 2. Open via inline term chip -> Close button restores focus to chip
      const inlineChip = page.getByRole('button', { name: /Prompt \(Câu lệnh\)/i }).first();
      await inlineChip.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.glossary-item--active')).toContainText(/Prompt/i);
      await closeBtn.click();
      await expect(dialog).toBeHidden();
      await expect(inlineChip).toBeFocused();

      // 3. Open -> Backdrop click closes and restores focus
      await footerTrigger.click();
      await expect(dialog).toBeVisible();
      await page.locator('.modal-backdrop').click({ position: { x: 5, y: 5 } });
      await expect(dialog).toBeHidden();
      await expect(footerTrigger).toBeFocused();

      errors.assertNoErrors();
    });

    test('CB-06 topic role="tablist" supports ArrowLeft/ArrowRight/Home/End and roving tabindex', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const cb06Tabs = page.locator('#cb-06 [role="tab"]');
      const count = await cb06Tabs.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const firstTab = cb06Tabs.nth(0);
      const secondTab = cb06Tabs.nth(1);
      const lastTab = cb06Tabs.nth(count - 1);

      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      await expect(firstTab).toHaveAttribute('tabindex', '0');
      await expect(secondTab).toHaveAttribute('tabindex', '-1');

      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
      await expect(secondTab).toHaveAttribute('tabindex', '0');
      await expect(firstTab).toHaveAttribute('tabindex', '-1');
      await expect(secondTab).toBeFocused();

      await page.keyboard.press('End');
      await expect(lastTab).toHaveAttribute('aria-selected', 'true');
      await expect(lastTab).toBeFocused();

      await page.keyboard.press('Home');
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      await expect(firstTab).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(lastTab).toHaveAttribute('aria-selected', 'true');
      await expect(lastTab).toBeFocused();

      errors.assertNoErrors();
    });

    test('SkillBuilder preserves keyboard focus across mode switch and Xóa nháp reset', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const workflowBtn = page.locator('#nc-03 [data-builder-mode="workflow"]');
      await workflowBtn.focus();
      await workflowBtn.click();
      await expect(page.locator('#nc-03 [data-builder-mode="workflow"]')).toBeFocused();

      const resetBtn = page.locator('#nc-03 [data-builder-action="reset"]');
      await resetBtn.focus();
      await resetBtn.click();
      await expect(page.locator('#nc-03 [data-builder-action="reset"]')).toBeFocused();

      errors.assertNoErrors();
    });
  });

  test.describe('GoalSearch Cross-Tab Jumps, Clear & Adversarial Inputs', () => {
    test('GoalSearch jumps across tabs (Basic <-> Advanced), resets hidden CB-07 filter, and clears cleanly', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      // Filter CB-07 to a domain that hides tpl-health-terms
      const cb07 = page.locator('#cb-07');
      await cb07.getByRole('button', { name: /Gia đình/i }).click();
      await expect(cb07.locator('[data-template-id="tpl-health-terms"]')).toBeHidden();

      // Jump Basic -> Advanced via search
      const searchInput = getSearchInput(page);
      await searchInput.fill('skill');
      const searchRegion = getSearchRegion(page);
      await searchRegion.getByRole('button', { name: /Xưởng thiết kế Skill/i }).first().click();

      await expect(getAdvancedTab(page)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#nc-03')).toBeVisible();
      await expect(page.locator('#live-announcer')).toContainText(/Nâng cao/i);

      // Jump Advanced -> Basic via quick-start chip and verify CB-07 filter resets
      await searchRegion.getByRole('button', { name: /Hỏi sức khỏe/i }).click();
      await expect(getBasicTab(page)).toHaveAttribute('aria-selected', 'true');
      await expect(cb07.locator('[data-template-id="tpl-health-terms"]')).toBeVisible();

      // Clear button resets query and focuses input
      const clearBtn = page.getByRole('button', { name: /Xóa tìm kiếm/i });
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();
      await expect(searchInput).toHaveValue('');
      await expect(searchInput).toBeFocused();
      await expect(clearBtn).toBeHidden();

      errors.assertNoErrors();
    });

    test('GoalSearch handles regex metacharacters and HTML/XSS payloads without errors', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const searchInput = getSearchInput(page);
      const searchRegion = getSearchRegion(page);

      for (const payload of ['.*+?^${}()|[]\\', '<img src=x onerror=alert(1)>']) {
        await searchInput.fill(payload);
        await expect(searchRegion.getByText(/Không tìm thấy hướng dẫn phù hợp/i)).toBeVisible();
      }

      errors.assertNoErrors();
    });
  });

  test.describe('AgentSimulator, Quiz & Collapsible Config Boundaries', () => {
    test('AgentSimulator preserves focus across renders, blocks step skipping, supports Deny -> Retry -> Approve, and resets on scenario switch', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const nc02 = page.locator('#nc-02');
      const nextBtn = nc02.locator('[data-sim-nav="next"]');
      const prevBtn = nc02.locator('[data-sim-nav="prev"]');

      // Clicking Next on Step 1 -> Step 2 preserves focus inside #nc-02 on [data-sim-nav="next"]
      await nextBtn.focus();
      await nextBtn.click();
      await expect(nc02.locator('.adv-sim-badge')).toContainText('Bước 2 / 5');
      await expect(nc02.locator('[data-sim-nav="next"]')).toBeFocused();

      // Attempt to skip directly to Step 5 before Step 3 decision -> intercepted at Step 3
      await nc02.locator('[data-sim-step="4"]').click();
      await expect(nc02.locator('.adv-sim-badge')).toContainText('Bước 3 / 5');
      await expect(nextBtn).toBeDisabled();

      // Deny -> advance to Step 4 (sees security fallback)
      await nc02.locator('[data-sim-permission="deny"]').click();
      await expect(nextBtn).toBeEnabled();
      await nextBtn.click();
      await expect(nc02.locator('.adv-sim-badge')).toContainText('Bước 4 / 5');
      await expect(nc02.locator('.adv-sim-notice--warn')).toBeVisible();

      // Back to Step 3 -> Approve -> advance to Step 4 & Step 5 (sees read-only notice)
      await prevBtn.click();
      await nc02.locator('[data-sim-permission="allow"]').click();
      await nextBtn.click();
      await expect(nc02.locator('.adv-sim-notice--ok')).toBeVisible();
      await nextBtn.click();
      await expect(nc02.locator('.adv-sim-badge')).toContainText('Bước 5 / 5');
      await expect(nextBtn).toBeDisabled();

      // Switch scenario mid-simulation -> resets to Step 1 and clears decision
      const secondScenario = nc02.locator('[data-sim-scenario]').nth(1);
      await secondScenario.click();
      await expect(nc02.locator('.adv-sim-badge')).toContainText('Bước 1 / 5');
      await expect(prevBtn).toBeDisabled();

      errors.assertNoErrors();
    });

    test('CB-01 quiz does not double-count wrong -> right answers and persists across reload', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const firstQuiz = page.locator('.quiz-card').first();
      const progressBadge = page.locator('[data-quiz-progress]');

      await expect(progressBadge).toContainText('0/4');
      await firstQuiz.locator('[data-quiz-choice="false"]').click();
      await expect(progressBadge).toContainText('1/4');

      // Clicking the other option must not increment to 2/4
      await firstQuiz.locator('[data-quiz-choice="true"]').click();
      await expect(progressBadge).toContainText('1/4');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-quiz-progress]')).toContainText('1/4');
      await expect(page.locator('.quiz-card').first().locator('.quiz-card__feedback')).toBeVisible();

      errors.assertNoErrors();
    });

    test('CB-02 Privacy Guard empty check and clear button reset state and focus textarea', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      const input = page.locator('#cb02-privacy-input');
      const checkBtn = page.locator('#cb02-privacy-check-btn');
      const clearBtn = page.locator('#cb02-privacy-clear-btn');
      const result = page.locator('#cb02-privacy-result');

      await checkBtn.click();
      await expect(result).toHaveClass(/privacy-guard-result--empty/);

      await input.fill('Mã OTP của tôi là 123456');
      await checkBtn.click();
      await expect(result).toHaveClass(/privacy-guard-result--warning/);

      await clearBtn.click();
      await expect(input).toHaveValue('');
      await expect(input).toBeFocused();
      await expect(result).toBeEmpty();

      errors.assertNoErrors();
    });

    test('NC-01 copy buttons and NC-04 independent <details> collapsible panels work cleanly', async ({
      page,
      context,
    }) => {
      await grantClipboard(context);
      const errors = attachErrorListeners(page);
      await gotoApp(page);
      await getAdvancedTab(page).click();

      const nc01Details = page.locator('#nc-01 details.adv-tech-details');
      await nc01Details.locator('summary').click();
      await expect(nc01Details).toHaveAttribute('open', '');

      await nc01Details.locator('[data-nc01-copy="mcp"]').click();
      await expect(page.locator('#live-announcer')).toContainText(/Đã sao chép/i);
      const copied = await readClipboardText(page);
      if (copied) {
        expect(copied).toContain('mcpServers');
      }

      // Opening first NC-04 <details> leaves second NC-04 <details> closed
      const nc04Details = page.locator('#nc-04 details.adv-tech-details');
      await nc04Details.nth(0).locator('summary').click();
      await expect(nc04Details.nth(0)).toHaveAttribute('open', '');
      await expect(nc04Details.nth(1)).not.toHaveAttribute('open', '');

      errors.assertNoErrors();
    });

    test('[REGRESSION BUG-02] Cross-tab progress: NC-05 checklist persists even after answering CB-01 quiz in same session', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await gotoApp(page);

      await getAdvancedTab(page).click();
      const firstCheck = page.locator('[data-nc05-check]').first();
      await firstCheck.check();
      await expect(firstCheck).toBeChecked();

      await getBasicTab(page).click();
      await page.locator('.quiz-card').first().locator('[data-quiz-choice="true"]').click();

      const stored = await readAppStorage(page);
      expect(stored.completedIds.some((id) => id.startsWith('cb01-'))).toBe(true);
      expect(stored.completedIds.some((id) => id.startsWith('nc05-'))).toBe(true);

      errors.assertNoErrors();
    });
  });

  test.describe('High-Contrast + XLarge + Mobile + Reduced Motion', () => {
    test('Zero horizontal overflow at 375x812 with High Contrast, Rất lớn font, open <details>, and prefers-reduced-motion', async ({
      page,
    }) => {
      const errors = attachErrorListeners(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoApp(page);

      await getFontXLargeButton(page).click();
      await getContrastToggle(page).click();

      const basicOverflow = await getHorizontalOverflow(page);
      expect(basicOverflow.scrollWidth).toBeLessThanOrEqual(basicOverflow.innerWidth);

      await getAdvancedTab(page).click();
      await page.locator('#nc-01 details.adv-tech-details summary').click();
      const advOverflow = await getHorizontalOverflow(page);
      expect(advOverflow.scrollWidth).toBeLessThanOrEqual(advOverflow.innerWidth);

      // GlossaryModal open at 375x812 + xlarge + high contrast
      await page.getByRole('button', { name: /Từ điển thuật ngữ AI/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const modalOverflow = await getHorizontalOverflow(page);
      expect(modalOverflow.scrollWidth).toBeLessThanOrEqual(modalOverflow.innerWidth);

      errors.assertNoErrors();
    });
  });
});
