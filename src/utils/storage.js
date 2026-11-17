export const STORAGE_KEY = 'lam_chu_ai_v1';

const VALID_TABS = new Set(['basic', 'advanced']);
const VALID_FONT_SIZES = new Set(['medium', 'large', 'xlarge']);
const VALID_CONTRASTS = new Set(['warm', 'high']);

export const DEFAULT_STATE = Object.freeze({
  activeTab: 'basic',
  fontSize: 'medium',
  contrast: 'warm',
  favorites: [],
  completedIds: [],
});

function getDefaultCopy() {
  return {
    activeTab: DEFAULT_STATE.activeTab,
    fontSize: DEFAULT_STATE.fontSize,
    contrast: DEFAULT_STATE.contrast,
    favorites: [],
    completedIds: [],
  };
}

function getStorage(storageOverride) {
  if (storageOverride !== undefined) {
    return storageOverride;
  }
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return getDefaultCopy();
  }

  return {
    activeTab: VALID_TABS.has(raw.activeTab) ? raw.activeTab : DEFAULT_STATE.activeTab,
    fontSize: VALID_FONT_SIZES.has(raw.fontSize) ? raw.fontSize : DEFAULT_STATE.fontSize,
    contrast: VALID_CONTRASTS.has(raw.contrast) ? raw.contrast : DEFAULT_STATE.contrast,
    favorites: Array.isArray(raw.favorites)
      ? raw.favorites.filter((item) => typeof item === 'string')
      : [],
    completedIds: Array.isArray(raw.completedIds)
      ? raw.completedIds.filter((item) => typeof item === 'string')
      : [],
  };
}

export function loadState(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) {
    return getDefaultCopy();
  }

  try {
    const rawJson = storage.getItem(STORAGE_KEY);
    if (!rawJson) {
      return getDefaultCopy();
    }
    const parsed = JSON.parse(rawJson);
    return sanitizeState(parsed);
  } catch {
    return getDefaultCopy();
  }
}

export function saveState(partialState, storageOverride) {
  const current = loadState(storageOverride);
  const merged = sanitizeState({
    ...current,
    ...(partialState && typeof partialState === 'object' && !Array.isArray(partialState)
      ? partialState
      : {}),
  });

  const storage = getStorage(storageOverride);
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // Ignore quota or restricted storage errors gracefully
    }
  }

  return merged;
}

export function resetState(storageOverride) {
  const storage = getStorage(storageOverride);
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore restricted storage errors gracefully
    }
  }

  return getDefaultCopy();
}
