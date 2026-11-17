import { buildSearchIndex, searchItems, QUICK_START_GOALS } from '../utils/search.js';

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

function isElementFocusable(el) {
  if (!el) return false;
  if (el.hasAttribute('tabindex')) return true;
  const tag = el.tagName;
  return tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
}

export function createGoalSearch(
  mountEl,
  { onNavigate, liveAnnouncerEl, items, goals } = {}
) {
  if (!mountEl) {
    throw new Error('createGoalSearch requires a valid mountEl');
  }

  const searchIndex = Array.isArray(items) && items.length > 0 ? items : buildSearchIndex();
  const quickGoals = Array.isArray(goals) && goals.length > 0 ? goals : QUICK_START_GOALS;

  const chipsHtml = quickGoals
    .map(
      (goal, idx) => `
      <button
        type="button"
        class="goal-chip"
        data-goal-index="${idx}"
      >
        <span class="goal-chip__label">${escapeHtml(goal.label)}</span>
        <span class="goal-chip__tab">${escapeHtml(goal.tabLabel || (goal.tab === 'advanced' ? 'Nâng cao' : 'Cơ bản'))}</span>
      </button>
    `
    )
    .join('');

  mountEl.innerHTML = `
    <section class="card goal-search" role="search" aria-labelledby="goal-search-title">
      <h2 id="goal-search-title" class="card__title">Bạn muốn làm gì hôm nay?</h2>
      <p id="goal-search-hint" class="goal-search__hint">
        Gõ từ khóa (không cần gõ dấu tiếng Việt) hoặc bấm nhanh một nhu cầu bên dưới để đi thẳng tới hướng dẫn phù hợp.
      </p>

      <div class="goal-search__field-wrap">
        <label for="goal-search-input" class="goal-search__label">
          Tìm hướng dẫn hoặc mẫu câu lệnh
        </label>
        <div class="goal-search__input-row">
          <input
            type="search"
            id="goal-search-input"
            class="goal-search__input"
            placeholder="Ví dụ: viết thư, sức khỏe, tóm tắt, drive, skill..."
            autocomplete="off"
            aria-describedby="goal-search-hint"
          />
          <button
            type="button"
            id="goal-search-clear"
            class="btn btn--secondary goal-search__clear"
            hidden
          >
            Xóa tìm kiếm
          </button>
        </div>
      </div>

      <div class="goal-search__chips-wrap" role="group" aria-label="Nhu cầu hay dùng">
        ${chipsHtml}
      </div>

      <div id="goal-search-results-wrap" class="goal-search__results-wrap" aria-live="polite" hidden>
        <p id="goal-search-status" class="goal-search__status"></p>
        <ul id="goal-search-results" class="goal-search__results"></ul>
        <p id="goal-search-empty" class="goal-search__empty" hidden>
          Không tìm thấy hướng dẫn phù hợp. Hãy thử từ khóa ngắn hơn như <strong>thư</strong>, <strong>sức khỏe</strong>, <strong>tóm tắt</strong> hoặc <strong>skill</strong>.
        </p>
      </div>
    </section>
  `;

  const inputEl = mountEl.querySelector('#goal-search-input');
  const clearBtn = mountEl.querySelector('#goal-search-clear');
  const resultsWrapEl = mountEl.querySelector('#goal-search-results-wrap');
  const statusEl = mountEl.querySelector('#goal-search-status');
  const resultsListEl = mountEl.querySelector('#goal-search-results');
  const emptyEl = mountEl.querySelector('#goal-search-empty');

  let currentResults = [];

  function navigateToItem(item) {
    if (!item) return;

    if (typeof onNavigate === 'function') {
      onNavigate(item);
    }

    // Ensure CB-07 template card is visible if filtered out by domain filter
    if (item.sectionId === 'cb-07' && item.templateId) {
      const cb07Section = document.getElementById('cb-07');
      if (cb07Section) {
        const targetCard = cb07Section.querySelector(`[data-template-id="${item.templateId}"]`);
        if (targetCard && targetCard.hidden) {
          const allBtn = cb07Section.querySelector('[data-cb07-domain="all"]');
          if (allBtn) {
            allBtn.click();
          }
        }
      }
    }

    // Activate matching scenario in NC-02 simulator if applicable
    if (item.sectionId === 'nc-02' && item.scenarioId) {
      const nc02Section = document.getElementById('nc-02');
      if (nc02Section) {
        const scenarioBtn = nc02Section.querySelector(`[data-sim-scenario="${item.scenarioId}"]`);
        if (scenarioBtn) {
          scenarioBtn.click();
        }
      }
    }

    const targetEl =
      (item.targetSelector ? document.querySelector(item.targetSelector) : null) ||
      (item.sectionId ? document.getElementById(item.sectionId) : null);

    if (targetEl) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (typeof targetEl.scrollIntoView === 'function') {
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }

      if (!isElementFocusable(targetEl)) {
        targetEl.setAttribute('tabindex', '-1');
      }
      targetEl.focus({ preventScroll: true });
    }

    const label = item.title || item.label || 'mục đã chọn';
    const tabName = item.tabLabel || (item.tab === 'advanced' ? 'Nâng cao' : 'Cơ bản');
    announce(liveAnnouncerEl, `Đã chuyển đến ${label} trong mục ${tabName}.`);
  }

  function renderResults(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      currentResults = [];
      clearBtn.hidden = true;
      resultsWrapEl.hidden = true;
      resultsListEl.innerHTML = '';
      statusEl.textContent = '';
      emptyEl.hidden = true;
      return;
    }

    clearBtn.hidden = false;
    resultsWrapEl.hidden = false;
    currentResults = searchItems(trimmed, searchIndex);

    if (currentResults.length === 0) {
      statusEl.textContent = `Không có kết quả cho "${trimmed}".`;
      resultsListEl.innerHTML = '';
      resultsListEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    resultsListEl.hidden = false;
    statusEl.textContent = `Tìm thấy ${currentResults.length} hướng dẫn phù hợp:`;

    resultsListEl.innerHTML = currentResults
      .map((item, idx) => {
        const tabLabel = item.tabLabel || (item.tab === 'advanced' ? 'Nâng cao' : 'Cơ bản');
        return `
          <li class="goal-search__result-item">
            <button
              type="button"
              class="goal-search__result-btn"
              data-result-index="${idx}"
            >
              <span class="goal-search__result-head">
                <span class="goal-search__result-badge">${escapeHtml(tabLabel)}</span>
                <span class="goal-search__result-title">${escapeHtml(item.title)}</span>
              </span>
              ${
                item.description
                  ? `<span class="goal-search__result-desc">${escapeHtml(item.description)}</span>`
                  : ''
              }
            </button>
          </li>
        `;
      })
      .join('');
  }

  inputEl.addEventListener('input', () => {
    renderResults(inputEl.value);
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    renderResults('');
    inputEl.focus();
    announce(liveAnnouncerEl, 'Đã xóa từ khóa tìm kiếm.');
  });

  mountEl.addEventListener('click', (event) => {
    const chipBtn = event.target.closest('[data-goal-index]');
    if (chipBtn) {
      const idx = Number(chipBtn.getAttribute('data-goal-index'));
      const goal = quickGoals[idx];
      if (goal) {
        navigateToItem(goal);
      }
      return;
    }

    const resultBtn = event.target.closest('[data-result-index]');
    if (resultBtn) {
      const idx = Number(resultBtn.getAttribute('data-result-index'));
      const item = currentResults[idx];
      if (item) {
        navigateToItem(item);
      }
    }
  });

  return {
    search: (q) => {
      inputEl.value = q;
      renderResults(q);
    },
    clear: () => {
      inputEl.value = '';
      renderResults('');
    },
  };
}
