import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COPY_SUCCESS_MESSAGE,
  COPY_FAILURE_MESSAGE,
  copyText,
  renderPasteGuide,
} from '../../src/utils/clipboard.js';

test('copyText returns false and announces failure on empty input', async () => {
  const liveRegion = { textContent: '' };
  const ok = await copyText('', liveRegion);
  assert.equal(ok, false);
  assert.equal(liveRegion.textContent, COPY_FAILURE_MESSAGE);
});

test('copyText uses navigator.clipboard.writeText when available and announces success', async () => {
  const originalNavigator = globalThis.navigator;
  let writtenText = null;

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText(text) {
          writtenText = text;
        },
      },
    },
  });

  try {
    const liveRegion = { textContent: '' };
    const ok = await copyText('Xin chào AI', liveRegion);
    assert.equal(ok, true);
    assert.equal(writtenText, 'Xin chào AI');
    assert.equal(liveRegion.textContent, COPY_SUCCESS_MESSAGE);
  } finally {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test('copyText announces failure when clipboard API rejects and no DOM fallback exists', async () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText() {
          throw new Error('Permission denied');
        },
      },
    },
  });

  try {
    const liveRegion = { textContent: '' };
    const ok = await copyText('Xin chào AI', liveRegion);
    assert.equal(ok, false);
    assert.equal(liveRegion.textContent, COPY_FAILURE_MESSAGE);
  } finally {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test('renderPasteGuide populates container with 3-step Vietnamese paste guide', () => {
  const container = { innerHTML: '' };
  renderPasteGuide(container);
  assert.match(container.innerHTML, /paste-guide-title/);
  assert.match(container.innerHTML, /Sao chép/);
  assert.match(container.innerHTML, /ChatGPT, Gemini hoặc Claude/);
  assert.match(container.innerHTML, /Ctrl\+V/);
});

test('copyText handles non-string inputs and omitted liveRegionEl safely', async () => {
  assert.equal(await copyText(null), false);
  assert.equal(await copyText(undefined, { textContent: '' }), false);
  assert.equal(await copyText(12345, { textContent: '' }), false);
});

test('copyText falls back to document.execCommand when navigator.clipboard is unavailable or rejects', async () => {
  const originalNavigator = globalThis.navigator;
  const originalDocument = globalThis.document;

  const appended = [];
  const fakeTextarea = {
    value: '',
    style: {},
    setAttribute() {},
    focus() {},
    select() {},
  };

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {},
  });

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      body: {
        appendChild(el) {
          appended.push(el);
        },
        removeChild(el) {
          const idx = appended.indexOf(el);
          if (idx >= 0) appended.splice(idx, 1);
        },
      },
      createElement() {
        return fakeTextarea;
      },
      execCommand(cmd) {
        return cmd === 'copy';
      },
    },
  });

  try {
    const liveRegion = { textContent: '' };
    const ok = await copyText('Mẫu câu lệnh', liveRegion);
    assert.equal(ok, true);
    assert.equal(fakeTextarea.value, 'Mẫu câu lệnh');
    assert.equal(appended.length, 0); // cleaned up in finally
    assert.equal(liveRegion.textContent, COPY_SUCCESS_MESSAGE);

    // execCommand returns false -> failure
    globalThis.document.execCommand = () => false;
    const fail = await copyText('Mẫu câu lệnh', liveRegion);
    assert.equal(fail, false);
    assert.equal(liveRegion.textContent, COPY_FAILURE_MESSAGE);
  } finally {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
  }
});

test('renderPasteGuide handles null container safely', () => {
  assert.doesNotThrow(() => renderPasteGuide(null));
});
