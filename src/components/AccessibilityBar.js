const FONT_OPTIONS = [
  { id: 'medium', label: 'Vừa', description: 'Cỡ chữ vừa (18px)' },
  { id: 'large', label: 'Lớn', description: 'Cỡ chữ lớn (21px)' },
  { id: 'xlarge', label: 'Rất lớn', description: 'Cỡ chữ rất lớn (24px)' },
];

const CONTRAST_OPTIONS = [
  { id: 'warm', label: 'Dịu mắt', description: 'Nền giấy ấm dịu mắt' },
  { id: 'high', label: 'Tương phản cao', description: 'Chế độ tương phản cao đen trắng' },
];

export function createAccessibilityBar(
  container,
  { fontSize = 'medium', contrast = 'warm', onFontSizeChange, onContrastChange } = {}
) {
  if (!container) {
    throw new Error('AccessibilityBar requires a valid container element.');
  }

  container.innerHTML = `
    <div class="a11y-bar" role="region" aria-label="Tùy chỉnh hiển thị dễ đọc">
      <div class="a11y-bar__group" role="group" aria-label="Cỡ chữ">
        <span class="a11y-bar__label">Cỡ chữ:</span>
        ${FONT_OPTIONS.map(
          (opt) => `
          <button
            type="button"
            class="a11y-btn"
            data-a11y-font="${opt.id}"
            aria-pressed="${opt.id === fontSize ? 'true' : 'false'}"
            aria-label="${opt.description}"
          >
            ${opt.label}
          </button>
        `
        ).join('')}
      </div>
      <div class="a11y-bar__group" role="group" aria-label="Độ tương phản">
        <span class="a11y-bar__label">Màu nền:</span>
        ${CONTRAST_OPTIONS.map(
          (opt) => `
          <button
            type="button"
            class="a11y-btn"
            data-a11y-contrast="${opt.id}"
            aria-pressed="${opt.id === contrast ? 'true' : 'false'}"
            aria-label="${opt.description}"
          >
            ${opt.label}
          </button>
        `
        ).join('')}
      </div>
    </div>
  `;

  function update({ fontSize: nextFontSize, contrast: nextContrast }) {
    if (nextFontSize) {
      container.querySelectorAll('[data-a11y-font]').forEach((btn) => {
        const active = btn.getAttribute('data-a11y-font') === nextFontSize;
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    if (nextContrast) {
      container.querySelectorAll('[data-a11y-contrast]').forEach((btn) => {
        const active = btn.getAttribute('data-a11y-contrast') === nextContrast;
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  container.addEventListener('click', (event) => {
    const fontBtn = event.target.closest('[data-a11y-font]');
    if (fontBtn) {
      const nextSize = fontBtn.getAttribute('data-a11y-font');
      update({ fontSize: nextSize });
      if (typeof onFontSizeChange === 'function') {
        onFontSizeChange(nextSize);
      }
      return;
    }

    const contrastBtn = event.target.closest('[data-a11y-contrast]');
    if (contrastBtn) {
      const nextContrast = contrastBtn.getAttribute('data-a11y-contrast');
      update({ contrast: nextContrast });
      if (typeof onContrastChange === 'function') {
        onContrastChange(nextContrast);
      }
    }
  });

  return { update };
}
