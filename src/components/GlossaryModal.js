import { GLOSSARY_TERMS, findGlossaryTerm } from '../data/glossary.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);
}

export function createGlossaryModal({ onClose } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.hidden = true;

  backdrop.innerHTML = `
    <div
      class="modal-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <h2 id="glossary-modal-title" class="modal-title">Từ điển thuật ngữ AI dễ hiểu</h2>
          <p class="card__intro" style="margin-bottom: 0;">
            Giải thích bằng ví dụ đời thường, không dùng từ chuyên ngành khó hiểu.
          </p>
        </div>
        <button type="button" class="modal-close" aria-label="Đóng từ điển">
          Đóng ✕
        </button>
      </div>
      <div class="glossary-list" data-glossary-list></div>
    </div>
  `;

  const dialog = backdrop.querySelector('.modal-dialog');
  const closeBtn = backdrop.querySelector('.modal-close');
  const listEl = backdrop.querySelector('[data-glossary-list]');

  let lastTriggerEl = null;

  function renderTerms(activeTermId) {
    const matched = activeTermId ? findGlossaryTerm(activeTermId) : null;
    const activeId = matched ? matched.id : null;

    listEl.innerHTML = GLOSSARY_TERMS.map((item) => {
      const isActive = item.id === activeId;
      return `
        <article
          class="glossary-item ${isActive ? 'glossary-item--active' : ''}"
          data-term-id="${escapeHtml(item.id)}"
        >
          <h3 class="glossary-item__term">
            ${escapeHtml(item.term)} — ${escapeHtml(item.plainName)}
          </h3>
          <p class="glossary-item__meaning">${escapeHtml(item.meaning)}</p>
          <p class="glossary-item__analogy"><strong>Ví von dễ nhớ:</strong> ${escapeHtml(item.analogy)}</p>
          <p class="glossary-item__example">${escapeHtml(item.example)}</p>
        </article>
      `;
    }).join('');

    if (activeId) {
      const activeCard = listEl.querySelector(`[data-term-id="${activeId}"]`);
      if (activeCard && typeof activeCard.scrollIntoView === 'function') {
        activeCard.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function handleKeyDown(event) {
    if (backdrop.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialog.contains(active) || active === dialog) {
        event.preventDefault();
        if (event.shiftKey) {
          last.focus();
        } else {
          first.focus();
        }
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function open(termId, triggerEl) {
    lastTriggerEl = triggerEl || document.activeElement;
    renderTerms(termId);
    backdrop.hidden = false;
    document.addEventListener('keydown', handleKeyDown);
    closeBtn.focus();
  }

  function close() {
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    document.removeEventListener('keydown', handleKeyDown);

    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
    lastTriggerEl = null;

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  closeBtn.addEventListener('click', () => close());
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close();
    }
  });

  renderTerms(null);

  return {
    element: backdrop,
    open,
    close,
  };
}

export function wireGlossaryTriggers(rootEl, modalController) {
  if (!rootEl || !modalController) return;

  rootEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-glossary-term]');
    if (!trigger) return;
    const termId = trigger.getAttribute('data-glossary-term');
    modalController.open(termId, trigger);
  });
}
