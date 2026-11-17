const VALID_TABS = new Set(['basic', 'advanced']);

function parseTabFromHash(hash) {
  if (typeof hash !== 'string') return null;
  const cleaned = hash.replace(/^#/, '').trim().toLowerCase();
  if (VALID_TABS.has(cleaned)) return cleaned;
  if (/^cb-\d+$/.test(cleaned)) return 'basic';
  if (/^nc-\d+$/.test(cleaned)) return 'advanced';
  return null;
}

export function createTabNav({ tablistEl, panels, initialTab = 'basic', onTabChange } = {}) {
  if (!tablistEl || !panels) {
    throw new Error('TabNav requires tablistEl and panels.');
  }

  const tabButtons = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  let activeTab = VALID_TABS.has(initialTab) ? initialTab : 'basic';

  function getTabId(btn) {
    const dataTab = btn.getAttribute('data-tab');
    if (dataTab && VALID_TABS.has(dataTab)) return dataTab;
    return btn.id === 'tab-advanced' ? 'advanced' : 'basic';
  }

  function activateTab(tabId, { focusTab = false, skipHash = false, notify = true } = {}) {
    const nextTab = VALID_TABS.has(tabId) ? tabId : 'basic';
    activeTab = nextTab;

    tabButtons.forEach((btn) => {
      const btnTabId = getTabId(btn);
      const isSelected = btnTabId === nextTab;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (isSelected && focusTab) {
        btn.focus();
      }
    });

    Object.entries(panels).forEach(([id, panelEl]) => {
      if (!panelEl) return;
      panelEl.hidden = id !== nextTab;
    });

    if (!skipHash && typeof window !== 'undefined' && window.location) {
      const targetHash = `#${nextTab}`;
      if (window.location.hash !== targetHash) {
        if (window.history && typeof window.history.replaceState === 'function') {
          window.history.replaceState(null, '', targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    }

    if (notify && typeof onTabChange === 'function') {
      onTabChange(nextTab);
    }
  }

  tablistEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[role="tab"]');
    if (!btn) return;
    activateTab(getTabId(btn));
  });

  tablistEl.addEventListener('keydown', (event) => {
    const currentIndex = tabButtons.findIndex((btn) => btn === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabButtons.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabButtons.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      activateTab(getTabId(tabButtons[nextIndex]), { focusTab: true });
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      const hashTab = parseTabFromHash(window.location.hash);
      if (hashTab && hashTab !== activeTab) {
        activateTab(hashTab, { skipHash: true });
      }
    });
  }

  const rawHash = typeof window !== 'undefined' ? window.location.hash : '';
  const hashTab = parseTabFromHash(rawHash);
  const isSectionHash = /^#(?:cb|nc)-\d+$/i.test(rawHash.trim());
  activateTab(hashTab || activeTab, { skipHash: !hashTab || isSectionHash, notify: false });

  return {
    activateTab,
    getActiveTab: () => activeTab,
  };
}
