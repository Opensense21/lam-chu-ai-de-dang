import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  DEFAULT_STATE,
  loadState,
  saveState,
  resetState,
} from '../../src/utils/storage.js';

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('loadState returns defaults when storage is null or empty', () => {
  assert.deepEqual(loadState(null), DEFAULT_STATE);
  assert.deepEqual(loadState(createMockStorage()), DEFAULT_STATE);
});

test('loadState handles corrupted JSON, non-object JSON, and invalid enums safely', () => {
  const corrupted = createMockStorage({ [STORAGE_KEY]: '{not-valid-json' });
  assert.deepEqual(loadState(corrupted), DEFAULT_STATE);

  const arrayJson = createMockStorage({ [STORAGE_KEY]: '[1, 2, 3]' });
  assert.deepEqual(loadState(arrayJson), DEFAULT_STATE);

  const invalidEnums = createMockStorage({
    [STORAGE_KEY]: JSON.stringify({
      activeTab: 'hacker',
      fontSize: 'tiny',
      contrast: 'neon',
      favorites: ['ok', 123, null],
      completedIds: 'not-an-array',
    }),
  });
  assert.deepEqual(loadState(invalidEnums), {
    activeTab: 'basic',
    fontSize: 'medium',
    contrast: 'warm',
    favorites: ['ok'],
    completedIds: [],
  });
});

test('saveState merges partial updates and persists under STORAGE_KEY', () => {
  const mockStorage = createMockStorage();

  const s1 = saveState({ fontSize: 'large', contrast: 'high' }, mockStorage);
  assert.equal(s1.fontSize, 'large');
  assert.equal(s1.contrast, 'high');
  assert.equal(s1.activeTab, 'basic');

  const s2 = saveState({ activeTab: 'advanced', completedIds: ['cb-01'] }, mockStorage);
  assert.equal(s2.fontSize, 'large');
  assert.equal(s2.contrast, 'high');
  assert.equal(s2.activeTab, 'advanced');
  assert.deepEqual(s2.completedIds, ['cb-01']);

  const reloaded = loadState(mockStorage);
  assert.deepEqual(reloaded, s2);
});

test('resetState removes stored data and returns defaults', () => {
  const mockStorage = createMockStorage();
  saveState({ activeTab: 'advanced', fontSize: 'xlarge' }, mockStorage);

  const reset = resetState(mockStorage);
  assert.deepEqual(reset, DEFAULT_STATE);
  assert.equal(mockStorage.getItem(STORAGE_KEY), null);
});

test('storage functions do not throw when storage throws SecurityError', () => {
  const throwingStorage = {
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
    removeItem() {
      throw new Error('SecurityError');
    },
  };

  assert.deepEqual(loadState(throwingStorage), DEFAULT_STATE);
  assert.equal(saveState({ fontSize: 'large' }, throwingStorage).fontSize, 'large');
  assert.deepEqual(resetState(throwingStorage), DEFAULT_STATE);
});

test('loadState ignores __proto__ keys and wrong-typed favorites/completedIds without polluting Object.prototype', () => {
  const malicious = {
    getItem() {
      return '{"__proto__":{"polluted":true},"activeTab":"__proto__","fontSize":"huge","contrast":"x","favorites":"bad","completedIds":null}';
    },
    setItem() {},
    removeItem() {},
  };
  const state = loadState(malicious);
  assert.deepEqual(state, DEFAULT_STATE);
  assert.equal(({}).polluted, undefined);
});
