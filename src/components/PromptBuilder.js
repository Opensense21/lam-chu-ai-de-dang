import { CB04_BUILDER_SLOTS } from '../data/basic-guides.js';
import { assembleBasicPrompt, evaluatePromptQuality } from '../utils/prompt-helpers.js';
import { copyText } from '../utils/clipboard.js';
import { loadState, saveState } from '../utils/storage.js';

const SLOT_KEYS = ['role', 'context', 'task', 'format', 'constraints'];

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

function isValidPromptFavoriteObj(obj) {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      obj.id.length > 0 &&
      obj.fields &&
      typeof obj.fields === 'object' &&
      !Array.isArray(obj.fields)
  );
}

function isPromptFavoriteEntry(item) {
  if (typeof item !== 'string') return false;
  try {
    return isValidPromptFavoriteObj(JSON.parse(item));
  } catch {
    return false;
  }
}

function parseFavorites(rawList) {
  if (!Array.isArray(rawList)) return [];
  const parsed = [];
  for (const item of rawList) {
    if (typeof item !== 'string') continue;
    try {
      const obj = JSON.parse(item);
      if (isValidPromptFavoriteObj(obj)) {
        parsed.push(obj);
      }
    } catch {
      // Ignore malformed entries
    }
  }
  return parsed;
}

function persistPromptFavorites(nextPromptFavorites) {
  const latestFavorites = loadState().favorites;
  const nonPromptEntries = Array.isArray(latestFavorites)
    ? latestFavorites.filter((entry) => typeof entry === 'string' && !isPromptFavoriteEntry(entry))
    : [];
  saveState({ favorites: [...serializeFavorites(nextPromptFavorites), ...nonPromptEntries] });
}

function serializeFavorites(items) {
  return items.map((item) => JSON.stringify(item));
}

function getScoreStatusText(score) {
  if (score >= 80) {
    return 'Tuyệt vời! Câu lệnh đã rất rõ ràng, sẵn sàng sao chép gửi AI.';
  }
  if (score >= 40) {
    return 'Khá ổn rồi! Thêm chút chi tiết nữa để AI trả lời sát ý ngay lần đầu.';
  }
  return 'Cần thêm thông tin để AI hiểu rõ mong muốn của bạn hơn.';
}

export function createPromptBuilder({ initialFields = {}, liveAnnouncerEl = null } = {}) {
  const fields = {
    role: typeof initialFields.role === 'string' ? initialFields.role : '',
    context: typeof initialFields.context === 'string' ? initialFields.context : '',
    task: typeof initialFields.task === 'string' ? initialFields.task : '',
    format: typeof initialFields.format === 'string' ? initialFields.format : '',
    constraints: typeof initialFields.constraints === 'string' ? initialFields.constraints : '',
  };

  const section = document.createElement('section');
  section.id = 'cb-04';
  section.className = 'card';
  section.setAttribute('aria-labelledby', 'cb04-title');

  const slotsHtml = CB04_BUILDER_SLOTS.map((slot) => {
    const inputId = `cb04-${slot.id}`;
    const hintId = `cb04-${slot.id}-hint`;
    const chipsHtml = slot.chips
      .map(
        (chip) => `
        <button
          type="button"
          class="chip-btn"
          data-slot="${escapeHtml(slot.id)}"
          data-value="${escapeHtml(chip)}"
          aria-pressed="false"
        >
          ${escapeHtml(chip)}
        </button>
      `
      )
      .join('');

    const controlHtml =
      slot.inputType === 'textarea'
        ? `<textarea
            id="${escapeHtml(inputId)}"
            class="builder-textarea"
            data-slot-input="${escapeHtml(slot.id)}"
            rows="${slot.rows || 2}"
            aria-describedby="${escapeHtml(hintId)}"
            placeholder="${escapeHtml(slot.placeholder)}"
          ></textarea>`
        : `<input
            id="${escapeHtml(inputId)}"
            type="text"
            class="builder-input"
            data-slot-input="${escapeHtml(slot.id)}"
            aria-describedby="${escapeHtml(hintId)}"
            placeholder="${escapeHtml(slot.placeholder)}"
          />`;

    return `
      <div class="builder-slot">
        <div class="builder-slot__header">
          <label for="${escapeHtml(inputId)}" class="builder-slot__label">${escapeHtml(
      slot.label
    )}</label>
        </div>
        <p id="${escapeHtml(hintId)}" class="builder-slot__hint">${escapeHtml(slot.helperText)}</p>
        <div class="chip-group" role="group" aria-label="Gợi ý chọn nhanh">
          ${chipsHtml}
        </div>
        ${controlHtml}
      </div>
    `;
  }).join('');

  section.innerHTML = `
    <h2 id="cb04-title" class="card__title" tabindex="-1">
      Trợ lý ghép câu lệnh chuẩn trước khi gửi AI
    </h2>
    <p class="card__intro">
      Chọn nhanh các gợi ý bên dưới hoặc tự gõ bằng tiếng Việt bình thường. Ghép xong một lần là có câu lệnh hoàn chỉnh để dán sang ChatGPT, Gemini hoặc Claude.
    </p>

    <div class="prompt-builder">
      <div class="builder-slots">
        ${slotsHtml}
      </div>

      <div id="cb-05" class="quality-panel" aria-labelledby="cb05-title">
        <div class="quality-header">
          <h3 id="cb05-title" class="quality-header__title">Kiểm tra độ rõ ràng trước khi gửi</h3>
          <span id="cb05-score-badge" class="quality-score-badge quality-score-badge--needs-work" aria-live="polite">
            Độ rõ ràng: 0%
          </span>
        </div>
        <div
          id="cb05-progressbar"
          class="quality-meter"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
          aria-valuetext="0% sẵn sàng"
        >
          <div id="cb05-meter-fill" class="quality-meter__fill" style="width: 0%"></div>
        </div>
        <p id="cb05-status-text" class="builder-slot__hint"></p>
        <ul id="cb05-checklist" class="quality-checklist"></ul>
      </div>

      <div class="builder-preview" aria-labelledby="cb04-preview-title">
        <h3 id="cb04-preview-title" class="builder-preview__title">Câu lệnh hoàn chỉnh của bạn</h3>
        <div
          id="cb04-privacy-banner"
          class="builder-privacy-warning"
          role="alert"
          hidden
        ></div>
        <div id="cb04-preview" class="builder-preview__text" aria-live="polite"></div>
        <div class="builder-actions">
          <button type="button" id="cb04-copy-btn" class="btn btn--primary">
            Sao chép để dán vào AI
          </button>
          <button type="button" id="cb04-save-fav-btn" class="btn btn--secondary">
            Lưu mẫu yêu thích
          </button>
          <button type="button" id="cb04-clear-btn" class="btn btn--secondary">
            Xóa tất cả ô
          </button>
          <span id="cb04-copy-feedback" class="copy-feedback" role="status" aria-live="polite"></span>
        </div>
      </div>

      <div class="favorites-section" aria-labelledby="cb04-favorites-title">
        <h3 id="cb04-favorites-title">Mẫu câu lệnh yêu thích đã lưu</h3>
        <div id="cb04-favorites-container"></div>
      </div>
    </div>
  `;

  const inputEls = new Map();
  SLOT_KEYS.forEach((key) => {
    const el = section.querySelector(`[data-slot-input="${key}"]`);
    if (el) {
      el.value = fields[key];
      inputEls.set(key, el);
    }
  });

  const chipBtns = Array.from(section.querySelectorAll('.chip-btn'));
  const scoreBadgeEl = section.querySelector('#cb05-score-badge');
  const progressbarEl = section.querySelector('#cb05-progressbar');
  const meterFillEl = section.querySelector('#cb05-meter-fill');
  const statusTextEl = section.querySelector('#cb05-status-text');
  const checklistEl = section.querySelector('#cb05-checklist');
  const privacyBannerEl = section.querySelector('#cb04-privacy-banner');
  const previewEl = section.querySelector('#cb04-preview');
  const copyBtn = section.querySelector('#cb04-copy-btn');
  const saveFavBtn = section.querySelector('#cb04-save-fav-btn');
  const clearBtn = section.querySelector('#cb04-clear-btn');
  const feedbackEl = section.querySelector('#cb04-copy-feedback');
  const favoritesContainerEl = section.querySelector('#cb04-favorites-container');
  const titleEl = section.querySelector('#cb04-title');

  function syncChipStates() {
    chipBtns.forEach((btn) => {
      const slot = btn.getAttribute('data-slot');
      const val = btn.getAttribute('data-value');
      const isMatch = slot && val && fields[slot].trim() === val;
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
  }

  function renderFavoritesList() {
    if (!favoritesContainerEl) return;
    const favorites = parseFavorites(loadState().favorites);

    if (favorites.length === 0) {
      favoritesContainerEl.innerHTML =
        '<p class="builder-slot__hint">Chưa có mẫu yêu thích nào. Khi ghép được câu lệnh ưng ý, bấm <strong>Lưu mẫu yêu thích</strong> để dùng lại lần sau.</p>';
      return;
    }

    const itemsHtml = favorites
      .map((fav) => {
        const preview = assembleBasicPrompt(fav.fields);
        return `
          <li class="favorite-item" data-fav-id="${escapeHtml(fav.id)}">
            <strong>${escapeHtml(fav.title || 'Mẫu câu lệnh đã lưu')}</strong>
            <p class="favorite-item__preview">${escapeHtml(preview)}</p>
            <div class="favorite-item__actions">
              <button
                type="button"
                class="btn btn--secondary"
                data-fav-load="${escapeHtml(fav.id)}"
              >
                Tải vào bộ ghép
              </button>
              <button
                type="button"
                class="btn btn--secondary"
                data-fav-delete="${escapeHtml(fav.id)}"
              >
                Xóa
              </button>
            </div>
          </li>
        `;
      })
      .join('');

    favoritesContainerEl.innerHTML = `<ul id="cb04-favorites-list" class="favorites-list">${itemsHtml}</ul>`;
  }

  function updateAll() {
    const assembled = assembleBasicPrompt(fields);
    const { score, checks, privacyWarnings } = evaluatePromptQuality(fields);

    if (previewEl) {
      if (assembled) {
        previewEl.textContent = assembled;
      } else {
        previewEl.textContent =
          'Hãy chọn gợi ý hoặc gõ vào các ô ở trên để xem câu lệnh hoàn chỉnh tại đây...';
      }
    }

    if (copyBtn) {
      copyBtn.disabled = assembled.length === 0;
    }

    if (privacyBannerEl) {
      if (privacyWarnings.length > 0) {
        privacyBannerEl.hidden = false;
        const warningsHtml = privacyWarnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('');
        privacyBannerEl.innerHTML = `
          <p><strong>Cảnh báo riêng tư (${privacyWarnings.length}):</strong> Vui lòng xóa thông tin nhạy cảm trước khi sao chép gửi AI:</p>
          <ul>${warningsHtml}</ul>
        `;
      } else {
        privacyBannerEl.hidden = true;
        privacyBannerEl.innerHTML = '';
      }
    }

    if (scoreBadgeEl) {
      scoreBadgeEl.textContent = `Độ rõ ràng: ${score}%`;
      scoreBadgeEl.classList.remove('quality-score-badge--ready', 'quality-score-badge--needs-work');
      scoreBadgeEl.classList.add(
        score >= 80 ? 'quality-score-badge--ready' : 'quality-score-badge--needs-work'
      );
    }

    if (progressbarEl) {
      progressbarEl.setAttribute('aria-valuenow', String(score));
      progressbarEl.setAttribute('aria-valuetext', `${score}% sẵn sàng`);
    }

    if (meterFillEl) {
      meterFillEl.style.width = `${score}%`;
    }

    if (statusTextEl) {
      statusTextEl.textContent = getScoreStatusText(score);
    }

    if (checklistEl) {
      checklistEl.innerHTML = checks
        .map((item) => {
          const stateClass = item.passed ? 'quality-check-item--passed' : 'quality-check-item--pending';
          const icon = item.passed ? '✓' : '○';
          const stateLabel = item.passed ? 'Đã có' : 'Chưa có';
          return `
            <li class="quality-check-item ${stateClass}">
              <span class="quality-check-item__icon" aria-label="${escapeHtml(stateLabel)}">${icon}</span>
              <div>
                <div>${escapeHtml(item.label)}</div>
                <div class="builder-slot__hint">${escapeHtml(item.tip)}</div>
              </div>
            </li>
          `;
        })
        .join('');
    }

    syncChipStates();
  }

  // Wire chip clicks
  chipBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-slot');
      const value = btn.getAttribute('data-value');
      if (!slot || value === null) return;

      fields[slot] = value;
      const inputEl = inputEls.get(slot);
      if (inputEl) {
        inputEl.value = value;
      }
      if (feedbackEl) {
        feedbackEl.textContent = '';
      }
      updateAll();
      announce(liveAnnouncerEl, `Đã chọn gợi ý: ${value}`);
    });
  });

  // Wire manual typing
  inputEls.forEach((inputEl, slot) => {
    inputEl.addEventListener('input', () => {
      fields[slot] = inputEl.value;
      if (feedbackEl) {
        feedbackEl.textContent = '';
      }
      updateAll();
    });
  });

  // Wire Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const assembled = assembleBasicPrompt(fields);
      if (!assembled) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Hãy nhập hoặc chọn ít nhất một nội dung trước khi sao chép.';
        }
        announce(liveAnnouncerEl, 'Chưa có nội dung câu lệnh để sao chép.');
        return;
      }

      const copied = await copyText(assembled, liveAnnouncerEl);
      if (feedbackEl) {
        feedbackEl.textContent = copied
          ? 'Đã sao chép! Bạn hãy mở ChatGPT, Gemini hoặc Claude rồi bấm Dán.'
          : 'Không thể tự sao chép, bạn hãy bôi đen đoạn chữ trên để sao chép nhé.';
      }
    });
  }

  // Wire Save Favorite button
  if (saveFavBtn) {
    saveFavBtn.addEventListener('click', () => {
      const hasAny = SLOT_KEYS.some((key) => fields[key].trim().length > 0);
      if (!hasAny) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Hãy nhập ít nhất một ô trước khi lưu mẫu yêu thích.';
        }
        announce(liveAnnouncerEl, 'Hãy nhập ít nhất một nội dung trước khi lưu mẫu.');
        return;
      }

      const titleSource = fields.task.trim() || fields.role.trim() || fields.context.trim() || 'Mẫu câu lệnh';
      const newFav = {
        id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: titleSource.slice(0, 60),
        fields: { ...fields },
        createdAt: new Date().toISOString(),
      };

      const current = parseFavorites(loadState().favorites);
      const next = [newFav, ...current];
      persistPromptFavorites(next);
      renderFavoritesList();

      if (feedbackEl) {
        feedbackEl.textContent = 'Đã lưu vào danh sách mẫu yêu thích!';
      }
      announce(liveAnnouncerEl, 'Đã lưu mẫu yêu thích.');
    });
  }

  // Wire Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      SLOT_KEYS.forEach((key) => {
        fields[key] = '';
        const inputEl = inputEls.get(key);
        if (inputEl) {
          inputEl.value = '';
        }
      });
      if (feedbackEl) {
        feedbackEl.textContent = '';
      }
      updateAll();
      const firstInput = inputEls.get('role');
      if (firstInput) {
        firstInput.focus();
      }
      announce(liveAnnouncerEl, 'Đã xóa tất cả các ô nhập liệu.');
    });
  }

  // Wire Favorites Load & Delete via event delegation
  if (favoritesContainerEl) {
    favoritesContainerEl.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const loadBtn = target.closest('[data-fav-load]');
      if (loadBtn) {
        const favId = loadBtn.getAttribute('data-fav-load');
        const current = parseFavorites(loadState().favorites);
        const found = current.find((item) => item.id === favId);
        if (found) {
          setFields(found.fields, { scrollToBuilder: true });
          if (feedbackEl) {
            feedbackEl.textContent = 'Đã tải mẫu yêu thích vào các ô.';
          }
          announce(liveAnnouncerEl, `Đã tải mẫu ${found.title} vào trợ lý ghép câu lệnh.`);
        }
        return;
      }

      const deleteBtn = target.closest('[data-fav-delete]');
      if (deleteBtn) {
        const favId = deleteBtn.getAttribute('data-fav-delete');
        const current = parseFavorites(loadState().favorites);
        const next = current.filter((item) => item.id !== favId);
        persistPromptFavorites(next);
        renderFavoritesList();
        announce(liveAnnouncerEl, 'Đã xóa mẫu yêu thích.');
      }
    });
  }

  function setFields(nextFields = {}, { scrollToBuilder = false } = {}) {
    SLOT_KEYS.forEach((key) => {
      const val =
        nextFields && typeof nextFields === 'object' && typeof nextFields[key] === 'string'
          ? nextFields[key]
          : '';
      fields[key] = val;
      const inputEl = inputEls.get(key);
      if (inputEl) {
        inputEl.value = val;
      }
    });

    if (feedbackEl) {
      feedbackEl.textContent = '';
    }
    updateAll();

    if (scrollToBuilder) {
      if (typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (titleEl && typeof titleEl.focus === 'function') {
        titleEl.focus({ preventScroll: true });
      }
    }
  }

  function getFields() {
    return { ...fields };
  }

  // Initial render
  updateAll();
  renderFavoritesList();

  return {
    element: section,
    setFields,
    getFields,
  };
}
