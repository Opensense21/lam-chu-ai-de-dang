import { copyText } from '../utils/clipboard.js';
import {
  assembleSkillMarkdown,
  assembleWorkflowPrompt,
  evaluateSkillSpec,
  createSavedSkillItem,
  serializeSavedSkill,
  parseSavedSkill,
} from '../utils/skill-helpers.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function announce(liveAnnouncerEl, message) {
  if (!liveAnnouncerEl) return;
  liveAnnouncerEl.textContent = '';
  liveAnnouncerEl.textContent = message;
}

const EMPTY_SKILL_FIELDS = {
  name: '',
  trigger: '',
  steps: '',
  tools: '',
  safety: '',
};

const EMPTY_WORKFLOW_FIELDS = {
  name: '',
  input: '',
  steps: '',
  checkpoint: '',
  output: '',
};

const SKILL_FIELD_DEFS = [
  {
    key: 'name',
    label: '1. Tên kỹ năng (ngắn gọn, dễ nhớ)',
    type: 'input',
    placeholder: 'Ví dụ: tom-tat-bien-ban-hop',
  },
  {
    key: 'trigger',
    label: '2. Khi nào dùng kỹ năng này?',
    type: 'input',
    placeholder: 'Ví dụ: Khi tôi dán ghi chép cuộc họp hoặc đoạn tin nhắn dài cần tóm tắt.',
  },
  {
    key: 'steps',
    label: '3. Các bước AI cần làm theo thứ tự',
    type: 'textarea',
    rows: 4,
    placeholder:
      'Ví dụ:\n1. Lọc ra các quyết định đã chốt.\n2. Liệt kê việc cần làm kèm người phụ trách.\n3. Viết bằng câu ngắn dễ đọc.',
  },
  {
    key: 'tools',
    label: '4. Công cụ & quyền kết nối (MCP / Plugin)',
    type: 'input',
    placeholder: 'Ví dụ: Chỉ đọc văn bản người dùng dán vào (Read-only).',
  },
  {
    key: 'safety',
    label: '5. Quy tắc an toàn bắt buộc',
    type: 'input',
    placeholder: 'Ví dụ: Không tự ý gửi email hay suy đoán số liệu không có trong ghi chép.',
  },
];

const WORKFLOW_FIELD_DEFS = [
  {
    key: 'name',
    label: '1. Tên quy trình nhiều bước',
    type: 'input',
    placeholder: 'Ví dụ: Gom hóa đơn và lập bảng chi tiêu tháng',
  },
  {
    key: 'input',
    label: '2. Dữ liệu đầu vào (AI được phép đọc gì?)',
    type: 'input',
    placeholder: 'Ví dụ: Các file hóa đơn điện, nước trong thư mục Chỉ đọc (không chứa mật khẩu).',
  },
  {
    key: 'steps',
    label: '3. Các bước thực hiện lần lượt',
    type: 'textarea',
    rows: 4,
    placeholder:
      'Ví dụ:\n1. Đọc ngày và số tiền từng hóa đơn.\n2. Phân loại thành 4 nhóm chi tiêu.\n3. Cộng tổng từng nhóm.',
  },
  {
    key: 'checkpoint',
    label: '4. Điểm dừng xác nhận (Human-in-the-Loop)',
    type: 'input',
    placeholder: 'Ví dụ: Dừng lại hiện bảng nháp để tôi kiểm tra trước khi lưu file.',
  },
  {
    key: 'output',
    label: '5. Kết quả đầu ra mong muốn',
    type: 'input',
    placeholder: 'Ví dụ: Bảng tổng hợp ngắn gọn kèm 2 nhận xét chi tiêu.',
  },
];

export function createSkillBuilder(
  containerEl,
  { favorites = [], onFavoritesChange, liveAnnouncerEl } = {}
) {
  let mode = 'skill'; // 'skill' | 'workflow'
  let skillFields = { ...EMPTY_SKILL_FIELDS };
  let workflowFields = { ...EMPTY_WORKFLOW_FIELDS };
  let copyFeedbackText = '';

  // Parse initial saved skills from favorites prop
  let savedItems = (Array.isArray(favorites) ? favorites : [])
    .map((raw) => parseSavedSkill(raw))
    .filter(Boolean);

  const rootEl = document.createElement('section');
  rootEl.id = 'nc-03';
  rootEl.className = 'card adv-builder';
  rootEl.setAttribute('aria-labelledby', 'nc03-title');

  function getCurrentFields() {
    return mode === 'workflow' ? workflowFields : skillFields;
  }

  function computeMarkdown() {
    const fields = getCurrentFields();
    return mode === 'workflow'
      ? assembleWorkflowPrompt(fields)
      : assembleSkillMarkdown(fields);
  }

  function emitFavorites() {
    if (typeof onFavoritesChange === 'function') {
      const serialized = savedItems.map((item) => serializeSavedSkill(item)).filter(Boolean);
      onFavoritesChange(serialized);
    }
  }

  function updateLiveEvaluationAndPreview() {
    const fields = getCurrentFields();
    const evaluation = evaluateSkillSpec(mode, fields);
    const markdown = computeMarkdown();

    const scoreValueEl = rootEl.querySelector('[data-builder-score-value]');
    const scoreFillEl = rootEl.querySelector('[data-builder-score-fill]');
    const checksListEl = rootEl.querySelector('[data-builder-checks]');
    const privacyEl = rootEl.querySelector('[data-builder-privacy]');
    const previewEl = rootEl.querySelector('[data-builder-preview]');
    const copyBtnEl = rootEl.querySelector('[data-builder-action="copy"]');
    const saveBtnEl = rootEl.querySelector('[data-builder-action="save"]');

    if (scoreValueEl) {
      scoreValueEl.textContent = `${evaluation.score}%`;
    }
    if (scoreFillEl) {
      scoreFillEl.style.width = `${evaluation.score}%`;
    }
    if (checksListEl) {
      checksListEl.innerHTML = evaluation.checks
        .map(
          (chk) => `
          <li class="adv-check-item ${chk.passed ? 'adv-check-item--pass' : 'adv-check-item--miss'}">
            <span class="adv-check-item__mark" aria-hidden="true">${chk.passed ? '✓' : '○'}</span>
            <span class="adv-check-item__text">
              <strong>${escapeHtml(chk.label)}</strong>
              ${chk.passed ? '' : ` — <span class="adv-check-item__tip">${escapeHtml(chk.tip)}</span>`}
            </span>
          </li>
        `
        )
        .join('');
    }

    if (privacyEl) {
      if (evaluation.privacyWarnings.length > 0) {
        privacyEl.hidden = false;
        privacyEl.innerHTML = `
          <h4 class="adv-privacy-alert__title">Cảnh báo bảo mật (Privacy Guard)</h4>
          <ul class="adv-privacy-alert__list">
            ${evaluation.privacyWarnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}
          </ul>
        `;
      } else {
        privacyEl.hidden = true;
        privacyEl.innerHTML = '';
      }
    }

    if (previewEl) {
      previewEl.textContent =
        markdown ||
        (mode === 'workflow'
          ? '(Điền các ô bên trên để xem trước Quy trình nhiều bước của bạn...)'
          : '(Điền các ô bên trên để xem trước nội dung file SKILL.md...)');
    }

    if (copyBtnEl) {
      copyBtnEl.disabled = !markdown;
    }
    if (saveBtnEl) {
      saveBtnEl.disabled = !markdown;
    }
  }

  function renderSavedList() {
    const savedListEl = rootEl.querySelector('[data-builder-saved-list]');
    if (!savedListEl) return;

    if (savedItems.length === 0) {
      savedListEl.innerHTML = `
        <p class="adv-saved-empty">
          Chưa có mẫu nào được lưu. Khi thiết kế xong, bạn bấm <strong>Lưu vào kho</strong> để dùng lại bất cứ lúc nào.
        </p>
      `;
      return;
    }

    savedListEl.innerHTML = `
      <ul class="adv-saved-items">
        ${savedItems
          .map(
            (item) => `
          <li class="adv-saved-item" data-saved-id="${escapeHtml(item.id)}">
            <div class="adv-saved-item__info">
              <span class="adv-mode-badge">${item.mode === 'workflow' ? 'Workflow' : 'SKILL.md'}</span>
              <strong class="adv-saved-item__title">${escapeHtml(item.title)}</strong>
            </div>
            <div class="adv-saved-item__actions">
              <button
                type="button"
                class="btn btn--secondary"
                data-saved-action="load"
                data-saved-id="${escapeHtml(item.id)}"
              >
                Nạp vào xưởng
              </button>
              <button
                type="button"
                class="btn"
                data-saved-action="delete"
                data-saved-id="${escapeHtml(item.id)}"
              >
                Xóa
              </button>
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  function renderFull() {
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    let restoreSelector = null;
    if (activeEl && rootEl.contains(activeEl)) {
      if (activeEl.hasAttribute('data-builder-mode')) {
        restoreSelector = `[data-builder-mode="${activeEl.getAttribute('data-builder-mode')}"]`;
      } else if (activeEl.hasAttribute('data-builder-action')) {
        restoreSelector = `[data-builder-action="${activeEl.getAttribute('data-builder-action')}"]`;
      } else if (activeEl.hasAttribute('data-builder-field')) {
        restoreSelector = `[data-builder-field="${activeEl.getAttribute('data-builder-field')}"]`;
      }
    }

    const defs = mode === 'workflow' ? WORKFLOW_FIELD_DEFS : SKILL_FIELD_DEFS;
    const fields = getCurrentFields();

    const inputsHtml = defs
      .map((def) => {
        const inputId = `nc03-field-${mode}-${def.key}`;
        const val = fields[def.key] || '';
        if (def.type === 'textarea') {
          return `
            <div class="adv-field">
              <label class="adv-field__label" for="${escapeHtml(inputId)}">${escapeHtml(def.label)}</label>
              <textarea
                id="${escapeHtml(inputId)}"
                class="adv-field__control adv-field__textarea"
                rows="${def.rows || 4}"
                data-builder-field="${escapeHtml(def.key)}"
                placeholder="${escapeHtml(def.placeholder)}"
              >${escapeHtml(val)}</textarea>
            </div>
          `;
        }
        return `
          <div class="adv-field">
            <label class="adv-field__label" for="${escapeHtml(inputId)}">${escapeHtml(def.label)}</label>
            <input
              type="text"
              id="${escapeHtml(inputId)}"
              class="adv-field__control"
              data-builder-field="${escapeHtml(def.key)}"
              placeholder="${escapeHtml(def.placeholder)}"
              value="${escapeHtml(val)}"
            />
          </div>
        `;
      })
      .join('');

    rootEl.innerHTML = `
      <h2 id="nc03-title" class="card__title">NC-03: Xưởng thiết kế Skill &amp; Quy trình Agent</h2>
      <p class="card__intro">
        Tự ghép bản hướng dẫn chuẩn cho AI (SKILL.md) hoặc quy trình nhiều bước có điểm dừng kiểm tra, sau đó sao chép dán vào ChatGPT, Gemini hoặc Claude.
      </p>

      <div class="adv-mode-switcher" role="group" aria-label="Chọn chế độ thiết kế">
        <button
          type="button"
          class="btn adv-mode-btn"
          data-builder-mode="skill"
          aria-pressed="${mode === 'skill' ? 'true' : 'false'}"
        >
          Mẫu Kỹ năng (SKILL.md)
        </button>
        <button
          type="button"
          class="btn adv-mode-btn"
          data-builder-mode="workflow"
          aria-pressed="${mode === 'workflow' ? 'true' : 'false'}"
        >
          Quy trình nhiều bước (Workflow)
        </button>
      </div>

      <form class="adv-builder-form" novalidate>
        ${inputsHtml}
      </form>

      <div class="adv-privacy-alert" data-builder-privacy role="alert" hidden></div>

      <div class="adv-meter-box" aria-label="Đánh giá độ đầy đủ">
        <div class="adv-meter-box__header">
          <span>Độ hoàn chỉnh của mẫu:</span>
          <strong data-builder-score-value>0%</strong>
        </div>
        <div class="adv-meter-bar" aria-hidden="true">
          <div class="adv-meter-bar__fill" data-builder-score-fill style="width: 0%"></div>
        </div>
        <ul class="adv-check-list" data-builder-checks></ul>
      </div>

      <div class="adv-preview-box">
        <h3 class="adv-preview-box__title">Bản xem trước (sẵn sàng sao chép)</h3>
        <pre class="adv-preview-code" data-builder-preview></pre>
        <div class="adv-builder-actions">
          <button type="button" class="btn btn--primary" data-builder-action="copy">
            Sao chép
          </button>
          <button type="button" class="btn btn--secondary" data-builder-action="save">
            Lưu vào kho
          </button>
          <button type="button" class="btn" data-builder-action="reset">
            Xóa nháp
          </button>
          <span class="copy-feedback" data-builder-copy-feedback aria-live="polite">${escapeHtml(copyFeedbackText)}</span>
        </div>
      </div>

      <div class="adv-saved-section">
        <h3 class="adv-saved-section__title">Kho mẫu đã lưu</h3>
        <div data-builder-saved-list></div>
      </div>
    `;

    updateLiveEvaluationAndPreview();
    renderSavedList();

    if (restoreSelector) {
      const targetToFocus = rootEl.querySelector(restoreSelector);
      if (targetToFocus && typeof targetToFocus.focus === 'function') {
        targetToFocus.focus();
      }
    }
  }

  function loadTemplate(template) {
    if (!template || typeof template !== 'object') return;
    const nextMode = template.mode === 'workflow' ? 'workflow' : 'skill';
    const nextFields = template.fields && typeof template.fields === 'object' ? template.fields : {};

    mode = nextMode;
    if (nextMode === 'workflow') {
      workflowFields = {
        name: nextFields.name || template.title || '',
        input: nextFields.input || '',
        steps: Array.isArray(nextFields.steps) ? nextFields.steps.join('\n') : nextFields.steps || '',
        checkpoint: nextFields.checkpoint || '',
        output: nextFields.output || '',
      };
    } else {
      skillFields = {
        name: nextFields.name || template.title || '',
        trigger: nextFields.trigger || '',
        steps: Array.isArray(nextFields.steps) ? nextFields.steps.join('\n') : nextFields.steps || '',
        tools: nextFields.tools || '',
        safety: nextFields.safety || '',
      };
    }

    copyFeedbackText = '';
    renderFull();

    if (typeof rootEl.scrollIntoView === 'function') {
      rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const firstInput = rootEl.querySelector('[data-builder-field]');
    if (firstInput && typeof firstInput.focus === 'function') {
      firstInput.focus();
    }

    announce(
      liveAnnouncerEl,
      `Đã nạp mẫu "${template.title || nextFields.name || ''}" vào Xưởng thiết kế.`
    );
  }

  function getValues() {
    return {
      mode,
      fields: { ...getCurrentFields() },
      markdown: computeMarkdown(),
    };
  }

  function resetDraft() {
    if (mode === 'workflow') {
      workflowFields = { ...EMPTY_WORKFLOW_FIELDS };
    } else {
      skillFields = { ...EMPTY_SKILL_FIELDS };
    }
    copyFeedbackText = '';
    renderFull();
    announce(liveAnnouncerEl, 'Đã xóa nháp các ô nhập liệu.');
  }

  rootEl.addEventListener('input', (event) => {
    const fieldEl = event.target.closest('[data-builder-field]');
    if (!fieldEl) return;
    const key = fieldEl.getAttribute('data-builder-field');
    if (mode === 'workflow') {
      workflowFields[key] = fieldEl.value;
    } else {
      skillFields[key] = fieldEl.value;
    }
    copyFeedbackText = '';
    const feedbackEl = rootEl.querySelector('[data-builder-copy-feedback]');
    if (feedbackEl) feedbackEl.textContent = '';
    updateLiveEvaluationAndPreview();
  });

  rootEl.addEventListener('click', async (event) => {
    const modeBtn = event.target.closest('[data-builder-mode]');
    if (modeBtn) {
      const nextMode = modeBtn.getAttribute('data-builder-mode');
      if ((nextMode === 'skill' || nextMode === 'workflow') && nextMode !== mode) {
        mode = nextMode;
        copyFeedbackText = '';
        renderFull();
        announce(
          liveAnnouncerEl,
          nextMode === 'workflow'
            ? 'Đã chuyển sang chế độ Quy trình nhiều bước (Workflow).'
            : 'Đã chuyển sang chế độ Mẫu Kỹ năng (SKILL.md).'
        );
      }
      return;
    }

    const actionBtn = event.target.closest('[data-builder-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-builder-action');
      if (action === 'copy') {
        const markdown = computeMarkdown();
        if (!markdown) return;
        const ok = await copyText(markdown, liveAnnouncerEl);
        copyFeedbackText = ok ? 'Đã sao chép!' : 'Không thể tự động sao chép.';
        const feedbackEl = rootEl.querySelector('[data-builder-copy-feedback]');
        if (feedbackEl) feedbackEl.textContent = copyFeedbackText;
      } else if (action === 'save') {
        const markdown = computeMarkdown();
        if (!markdown) return;
        const item = createSavedSkillItem(mode, getCurrentFields(), markdown);
        savedItems = [item, ...savedItems];
        emitFavorites();
        renderSavedList();
        announce(liveAnnouncerEl, `Đã lưu "${item.title}" vào kho mẫu đã lưu.`);
      } else if (action === 'reset') {
        resetDraft();
      }
      return;
    }

    const savedBtn = event.target.closest('[data-saved-action]');
    if (savedBtn) {
      const savedAction = savedBtn.getAttribute('data-saved-action');
      const savedId = savedBtn.getAttribute('data-saved-id');
      const targetItem = savedItems.find((i) => i.id === savedId);

      if (savedAction === 'load' && targetItem) {
        loadTemplate(targetItem);
      } else if (savedAction === 'delete' && targetItem) {
        savedItems = savedItems.filter((i) => i.id !== savedId);
        emitFavorites();
        renderSavedList();
        announce(liveAnnouncerEl, `Đã xóa "${targetItem.title}" khỏi kho mẫu đã lưu.`);
      }
    }
  });

  renderFull();

  if (containerEl) {
    containerEl.innerHTML = '';
    containerEl.appendChild(rootEl);
  }

  return {
    element: rootEl,
    loadTemplate,
    getValues,
    resetDraft,
  };
}
