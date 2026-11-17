import './styles/basic.css';
import './styles/advanced.css';
import './styles/search.css';
import { loadState, saveState } from './utils/storage.js';
import { copyText, renderPasteGuide } from './utils/clipboard.js';
import { createAccessibilityBar } from './components/AccessibilityBar.js';
import { createTabNav } from './components/TabNav.js';
import { createGoalSearch } from './components/GoalSearch.js';
import { createGlossaryModal, wireGlossaryTriggers } from './components/GlossaryModal.js';
import { createBasicTab } from './components/BasicTab.js';
import { createAdvancedTab } from './components/AdvancedTab.js';

function applyPreferencesToRoot({ fontSize, contrast }) {
  const root = document.documentElement;
  root.setAttribute('data-font-size', fontSize);
  root.setAttribute('data-contrast', contrast);
}

function initApp() {
  const state = loadState();
  applyPreferencesToRoot(state);

  const a11yBarEl = document.getElementById('accessibility-bar');
  const tablistEl = document.getElementById('tab-nav');
  const panelBasicEl = document.getElementById('panel-basic');
  const basicTabContentEl = document.getElementById('basic-tab-content');
  const panelAdvancedEl = document.getElementById('panel-advanced');
  const advancedTabContentEl = document.getElementById('advanced-tab-content');
  const pasteGuideEl = document.getElementById('paste-guide-section');
  const glossaryModalRootEl = document.getElementById('glossary-modal-root');
  const openGlossaryBtn = document.getElementById('open-glossary-btn');
  const liveAnnouncerEl = document.getElementById('live-announcer');

  const goalSearchMountEl = document.getElementById('goal-search-mount');

  if (a11yBarEl) {
    createAccessibilityBar(a11yBarEl, {
      fontSize: state.fontSize,
      contrast: state.contrast,
      onFontSizeChange: (nextFontSize) => {
        document.documentElement.setAttribute('data-font-size', nextFontSize);
        saveState({ fontSize: nextFontSize });
      },
      onContrastChange: (nextContrast) => {
        document.documentElement.setAttribute('data-contrast', nextContrast);
        saveState({ contrast: nextContrast });
      },
    });
  }

  let tabNav = null;
  if (tablistEl && panelBasicEl && panelAdvancedEl) {
    tabNav = createTabNav({
      tablistEl,
      panels: {
        basic: panelBasicEl,
        advanced: panelAdvancedEl,
      },
      initialTab: state.activeTab,
      onTabChange: (nextTab) => {
        saveState({ activeTab: nextTab });
      },
    });
  }

  if (goalSearchMountEl) {
    createGoalSearch(goalSearchMountEl, {
      liveAnnouncerEl,
      onNavigate: (item) => {
        if (tabNav && item?.tab) {
          tabNav.activateTab(item.tab);
        }
      },
    });
  }

  if (basicTabContentEl) {
    createBasicTab(basicTabContentEl, {
      completedIds: state.completedIds,
      liveAnnouncerEl,
      onProgressChange: (nextCompletedIds) => {
        const latest = loadState().completedIds;
        const otherIds = latest.filter((id) => !id.startsWith('cb01-'));
        const nextCb01Ids = Array.isArray(nextCompletedIds)
          ? nextCompletedIds.filter((id) => typeof id === 'string' && id.startsWith('cb01-'))
          : [];
        const merged = Array.from(new Set([...otherIds, ...nextCb01Ids]));
        saveState({ completedIds: merged });
      },
    });
  }

  if (advancedTabContentEl) {
    createAdvancedTab(advancedTabContentEl, {
      completedIds: state.completedIds,
      favorites: state.favorites,
      liveAnnouncerEl,
      onProgressChange: (nextNc05Ids) => {
        const latest = loadState().completedIds;
        const otherIds = latest.filter((id) => !id.startsWith('nc05-'));
        const merged = Array.from(new Set([...otherIds, ...nextNc05Ids]));
        saveState({ completedIds: merged });
      },
      onFavoritesChange: (nextSkillEntries) => {
        const latestFavorites = loadState().favorites;
        const nonSkillEntries = latestFavorites.filter(
          (entry) => typeof entry === 'string' && !entry.startsWith('skill_v1:')
        );
        saveState({ favorites: [...nonSkillEntries, ...nextSkillEntries] });
      },
    });
  }

  if (pasteGuideEl) {
    renderPasteGuide(pasteGuideEl);
  }

  if (glossaryModalRootEl) {
    const glossaryModal = createGlossaryModal();
    glossaryModalRootEl.appendChild(glossaryModal.element);
    wireGlossaryTriggers(document.body, glossaryModal);

    if (openGlossaryBtn) {
      openGlossaryBtn.addEventListener('click', () => {
        glossaryModal.open(null, openGlossaryBtn);
      });
    }
  }

  const sampleCopyBtn = document.getElementById('m1-sample-copy-btn');
  const samplePromptEl = document.getElementById('m1-sample-prompt-text');
  const sampleFeedbackEl = document.getElementById('m1-copy-feedback');

  if (sampleCopyBtn && samplePromptEl) {
    sampleCopyBtn.addEventListener('click', async () => {
      const ok = await copyText(samplePromptEl.textContent.trim(), liveAnnouncerEl);
      if (sampleFeedbackEl) {
        sampleFeedbackEl.textContent = ok
          ? 'Đã sao chép!'
          : 'Chưa sao chép được, hãy chọn thủ công.';
      }
    });
  }
}

initApp();
