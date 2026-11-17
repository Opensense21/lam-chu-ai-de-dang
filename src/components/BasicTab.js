import {
  CB01_INTRO,
  CB02_SAFETY,
  CB03_PRINCIPLES,
  CB06_COMPARISONS,
  CB07_TEMPLATES,
} from '../data/basic-guides.js';
import { assembleBasicPrompt, detectSensitiveInfo } from '../utils/prompt-helpers.js';
import { copyText } from '../utils/clipboard.js';
import { createPromptBuilder } from './PromptBuilder.js';

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
  // Force a DOM text mutation so screen readers re-announce if needed
  liveAnnouncerEl.textContent = message;
}

function renderCB01Section(completedSet) {
  const totalQuestions = CB01_INTRO.miniQuiz.length;
  const completedCount = CB01_INTRO.miniQuiz.filter((item) =>
    completedSet.has(`cb01-quiz-${item.id}`)
  ).length;

  const analogiesHtml = CB01_INTRO.analogies
    .map(
      (item) => `
      <li class="basic-analogy-item">
        <h3 class="basic-analogy-item__title">${escapeHtml(item.title)}</h3>
        <p class="basic-analogy-item__desc">${escapeHtml(item.description)}</p>
        <p class="basic-analogy-item__example">${escapeHtml(item.example)}</p>
      </li>
    `
    )
    .join('');

  const canDoHtml = CB01_INTRO.capabilities.canDoWell
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');

  const cannotDoHtml = CB01_INTRO.capabilities.cannotOrMakesMistakes
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');

  const quizCardsHtml = CB01_INTRO.miniQuiz
    .map((item) => {
      const progressId = `cb01-quiz-${item.id}`;
      const isPreviouslyDone = completedSet.has(progressId);
      return `
      <article class="quiz-card" data-quiz-id="${escapeHtml(item.id)}">
        <p class="quiz-card__question">${escapeHtml(item.question)}</p>
        <div class="quiz-card__actions" role="group" aria-label="Chọn câu trả lời">
          <button
            type="button"
            class="btn quiz-option-btn"
            data-quiz-choice="true"
            aria-pressed="false"
          >
            AI làm được
          </button>
          <button
            type="button"
            class="btn quiz-option-btn"
            data-quiz-choice="false"
            aria-pressed="false"
          >
            AI không nên làm
          </button>
        </div>
        <div class="quiz-card__feedback" role="status" aria-live="polite" ${
          isPreviouslyDone ? '' : 'hidden'
        }>
          ${
            isPreviouslyDone
              ? `<p class="quiz-card__feedback-status"><strong>Đã hoàn thành trước đó:</strong> ${escapeHtml(
                  item.explanation
                )}</p><p class="quiz-card__feedback-tip">${escapeHtml(item.tip)}</p>`
              : ''
          }
        </div>
      </article>
    `;
    })
    .join('');

  return `
    <section id="cb-01" class="card" aria-labelledby="cb01-title">
      <h2 id="cb01-title" class="card__title">${escapeHtml(CB01_INTRO.title)}</h2>
      <p class="card__intro">${escapeHtml(CB01_INTRO.intro)}</p>

      <ul class="basic-analogy-grid">
        ${analogiesHtml}
      </ul>

      <div class="basic-compare-grid">
        <div class="basic-compare-box basic-compare-box--good">
          <h3 class="basic-compare-box__title">AI làm rất tốt</h3>
          <ul class="basic-list">${canDoHtml}</ul>
        </div>
        <div class="basic-compare-box basic-compare-box--caution">
          <h3 class="basic-compare-box__title">AI không nên làm hoặc dễ nhầm</h3>
          <ul class="basic-list">${cannotDoHtml}</ul>
        </div>
      </div>

      <div class="basic-glossary-strip">
        <p class="basic-glossary-strip__label">
          <strong>Bấm vào từng từ để xem giải thích dễ hiểu:</strong>
        </p>
        <div class="glossary-chip-list">
          <button type="button" class="glossary-chip" data-glossary-term="ai">AI là gì?</button>
          <button type="button" class="glossary-chip" data-glossary-term="prompt">Prompt (Câu lệnh)</button>
          <button type="button" class="glossary-chip" data-glossary-term="context">Context (Bối cảnh)</button>
          <button type="button" class="glossary-chip" data-glossary-term="hallucination">Hallucination (AI đoán nhầm)</button>
        </div>
      </div>

      <div class="quiz-section">
        <div class="quiz-section__header">
          <h3 class="quiz-section__title">Thử tài nhanh: AI làm được không?</h3>
          <span class="quiz-progress-badge" data-quiz-progress aria-live="polite">
            Đã trả lời: ${completedCount}/${totalQuestions}
          </span>
        </div>
        <div class="quiz-grid">
          ${quizCardsHtml}
        </div>
      </div>
    </section>
  `;
}

function renderCB02Section() {
  const doNotShareHtml = CB02_SAFETY.doNotShare
    .map(
      (item) => `
      <li class="safety-item">
        <h3 class="safety-item__title">${escapeHtml(item.label)}</h3>
        <p class="safety-item__detail">${escapeHtml(item.detail)}</p>
        <p class="safety-item__safe">${escapeHtml(item.safeAlternative)}</p>
      </li>
    `
    )
    .join('');

  const antiScamStepsHtml = CB02_SAFETY.antiScamRule.steps
    .map(
      (step) => `
      <li class="scam-step">
        <span class="scam-step__num" aria-hidden="true">${escapeHtml(step.stepNumber)}</span>
        <div>
          <h4 class="scam-step__title">${escapeHtml(step.title)}</h4>
          <p class="scam-step__desc">${escapeHtml(step.description)}</p>
        </div>
      </li>
    `
    )
    .join('');

  return `
    <section id="cb-02" class="card" aria-labelledby="cb02-title">
      <h2 id="cb02-title" class="card__title">${escapeHtml(CB02_SAFETY.title)}</h2>
      <p class="card__intro">${escapeHtml(CB02_SAFETY.intro)}</p>

      <div class="safety-banner" role="note">
        <strong>Nguyên tắc vàng:</strong> KHÔNG chia sẻ với AI bất kỳ thông tin nào giúp người lạ biết bạn là ai hoặc rút được tiền của bạn.
      </div>

      <ul class="safety-list">
        ${doNotShareHtml}
      </ul>

      <div class="scam-rule-box">
        <div class="scam-rule-box__header">
          <h3 class="scam-rule-box__title">${escapeHtml(CB02_SAFETY.antiScamRule.title)}</h3>
          <button type="button" class="glossary-chip" data-glossary-term="hallucination">
            Xem giải thích: Hallucination (AI đoán nhầm)
          </button>
        </div>
        <ol class="scam-steps-list">
          ${antiScamStepsHtml}
        </ol>
      </div>

      <div class="privacy-guard-box">
        <h3 class="privacy-guard-box__title">Kiểm tra nhanh câu hỏi trước khi gửi cho AI</h3>
        <p class="privacy-guard-box__desc">
          Dán thử đoạn chữ bạn định hỏi vào ô dưới đây. Công cụ chạy hoàn toàn trên máy của bạn để nhắc nếu lỡ sót số CCCD, số điện thoại, thẻ ngân hàng, OTP hoặc mật khẩu.
        </p>
        <label for="cb02-privacy-input" class="privacy-guard-box__label">
          Nội dung bạn dự định hỏi AI:
        </label>
        <textarea
          id="cb02-privacy-input"
          class="privacy-guard-textarea"
          rows="4"
          placeholder="Ví dụ: Hãy viết giúp tôi đơn xin nghỉ phép... (hoặc thử gõ số điện thoại, CCCD để xem cảnh báo)"
        ></textarea>
        <div class="privacy-guard-actions">
          <button type="button" id="cb02-privacy-check-btn" class="btn btn--primary">
            Kiểm tra ngay
          </button>
          <button type="button" id="cb02-privacy-clear-btn" class="btn btn--secondary">
            Xóa chữ
          </button>
        </div>
        <div
          id="cb02-privacy-result"
          class="privacy-guard-result"
          role="status"
          aria-live="polite"
        ></div>
      </div>
    </section>
  `;
}

function renderCB03Section() {
  const principlesHtml = CB03_PRINCIPLES.principles
    .map(
      (item) => `
      <li class="principle-item">
        <span class="principle-item__num" aria-hidden="true">${escapeHtml(item.stepNumber)}</span>
        <div>
          <h3 class="principle-item__title">${escapeHtml(item.title)}</h3>
          <p class="principle-item__desc">${escapeHtml(item.description)}</p>
        </div>
      </li>
    `
    )
    .join('');

  const defaultBlock = CB03_PRINCIPLES.anatomyDiagram[0];

  const anatomyButtonsHtml = CB03_PRINCIPLES.anatomyDiagram
    .map((block, index) => {
      const isSelected = index === 0;
      return `
      <button
        type="button"
        class="anatomy-block"
        data-anatomy-id="${escapeHtml(block.id)}"
        aria-pressed="${isSelected ? 'true' : 'false'}"
        aria-controls="cb03-anatomy-detail"
      >
        <span class="anatomy-block__label">${escapeHtml(block.label)}</span>
        <span class="anatomy-block__question">${escapeHtml(block.shortQuestion)}</span>
      </button>
    `;
    })
    .join('');

  const combinedPreviewHtml = CB03_PRINCIPLES.anatomyDiagram
    .map((block, index) => {
      const isActive = index === 0;
      return `<span class="anatomy-preview-segment ${
        isActive ? 'is-highlighted' : ''
      }" data-preview-segment="${escapeHtml(block.id)}">${escapeHtml(block.example)}</span>`;
    })
    .join(' ');

  return `
    <section id="cb-03" class="card" aria-labelledby="cb03-title">
      <h2 id="cb03-title" class="card__title">${escapeHtml(CB03_PRINCIPLES.title)}</h2>
      <p class="card__intro">${escapeHtml(CB03_PRINCIPLES.intro)}</p>

      <ol class="principles-grid">
        ${principlesHtml}
      </ol>

      <div class="anatomy-section">
        <h3 class="anatomy-section__title">Cấu tạo 1 câu lệnh chuẩn gồm 4 mảnh ghép</h3>
        <p class="anatomy-section__hint">
          Bấm vào từng ô bên dưới để xem ví dụ và vị trí của mảnh ghép đó trong câu lệnh hoàn chỉnh:
        </p>

        <div class="anatomy-blocks-grid" role="group" aria-label="4 phần cấu tạo câu lệnh chuẩn">
          ${anatomyButtonsHtml}
        </div>

        <div id="cb03-anatomy-detail" class="anatomy-detail" role="region" aria-live="polite">
          <h4 class="anatomy-detail__title">${escapeHtml(defaultBlock.label)} — ${escapeHtml(
    defaultBlock.shortQuestion
  )}</h4>
          <p class="anatomy-detail__desc">${escapeHtml(defaultBlock.description)}</p>
          <p class="anatomy-detail__example">
            <strong>Ví dụ câu chữ:</strong> "${escapeHtml(defaultBlock.example)}"
          </p>
          <p class="anatomy-detail__why">
            <strong>Vì sao hữu ích:</strong> ${escapeHtml(defaultBlock.whyItHelps)}
          </p>
        </div>

        <div class="anatomy-preview-box">
          <p class="anatomy-preview-box__label">
            <strong>Câu lệnh hoàn chỉnh khi ghép cả 4 phần:</strong>
          </p>
          <p class="anatomy-preview-box__text">${combinedPreviewHtml}</p>
        </div>
      </div>
    </section>
  `;
}

function renderCB06Section() {
  const firstTopic = CB06_COMPARISONS[0];
  const topicTabsHtml = CB06_COMPARISONS.map(
    (item, index) => `
      <button
        type="button"
        role="tab"
        class="comparison-tab-btn"
        data-cb06-topic="${escapeHtml(item.id)}"
        aria-selected="${index === 0 ? 'true' : 'false'}"
        tabindex="${index === 0 ? '0' : '-1'}"
        aria-controls="cb06-panel"
      >
        ${escapeHtml(item.topic)}
      </button>
    `
  ).join('');

  return `
    <section id="cb-06" class="card" aria-labelledby="cb06-title">
      <h2 id="cb06-title" class="card__title">So sánh trước và sau: Vì sao hỏi đủ ý lại sát kết quả?</h2>
      <p class="card__intro">
        Chọn một chủ đề đời thường bên dưới rồi bấm chuyển giữa <strong>Cách hỏi chung chung</strong> và <strong>Cách hỏi chuẩn 5 phần</strong> để thấy sự khác biệt rõ rệt của câu trả lời AI.
      </p>

      <div class="comparison-tabs" role="tablist" aria-label="Chọn chủ đề so sánh">
        ${topicTabsHtml}
      </div>

      <div class="comparison-tabs" role="group" aria-label="Chọn kiểu câu lệnh để xem">
        <button
          type="button"
          class="comparison-tab-btn"
          data-cb06-mode="vague"
          aria-pressed="true"
        >
          Cách hỏi chung chung (chưa rõ)
        </button>
        <button
          type="button"
          class="comparison-tab-btn"
          data-cb06-mode="optimized"
          aria-pressed="false"
        >
          Cách hỏi chuẩn 5 phần (sát ý ngay)
        </button>
      </div>

      <div id="cb06-panel" role="tabpanel" aria-live="polite">
        <h3 id="cb06-topic-heading" class="anatomy-section__title">${escapeHtml(firstTopic.title)}</h3>
        <div class="comparison-grid">
          <div id="cb06-vague-box" class="comparison-box comparison-box--vague">
            <h4 class="comparison-box__title">Câu lệnh chung chung</h4>
            <p id="cb06-vague-prompt" class="comparison-box__prompt">${escapeHtml(firstTopic.vaguePrompt)}</p>
            <p class="builder-slot__hint"><strong>AI thường trả lời:</strong></p>
            <p id="cb06-vague-response" class="comparison-box__response">${escapeHtml(firstTopic.vagueResponse)}</p>
          </div>
          <div id="cb06-optimized-box" class="comparison-box comparison-box--optimized" hidden>
            <h4 class="comparison-box__title">Câu lệnh chuẩn 5 phần</h4>
            <p id="cb06-optimized-prompt" class="comparison-box__prompt">${escapeHtml(firstTopic.optimizedPrompt)}</p>
            <p class="builder-slot__hint"><strong>AI trả lời sát ý ngay:</strong></p>
            <p id="cb06-optimized-response" class="comparison-box__response">${escapeHtml(firstTopic.optimizedResponse)}</p>
          </div>
        </div>
        <div id="cb06-why-box" class="anatomy-detail" style="margin-top: var(--space-4);">
          <p id="cb06-why-text" class="anatomy-detail__why">
            <strong>Vì sao cách chuẩn tốt hơn:</strong> ${escapeHtml(firstTopic.whyBetter)}
          </p>
        </div>
        <div class="builder-actions" style="margin-top: var(--space-3);">
          <button type="button" id="cb06-load-btn" class="btn btn--primary" data-cb06-load>
            Đưa mẫu chuẩn này vào Trợ lý ghép câu lệnh
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderCB07Section() {
  const domainMap = new Map();
  CB07_TEMPLATES.forEach((tpl) => {
    if (!domainMap.has(tpl.domain)) {
      domainMap.set(tpl.domain, tpl.domainLabel);
    }
  });

  const domainButtonsHtml = [
    `<button type="button" class="template-domain-btn" data-cb07-domain="all" aria-pressed="true">Tất cả (${CB07_TEMPLATES.length})</button>`,
    ...Array.from(domainMap.entries()).map(
      ([domain, label]) => `
        <button type="button" class="template-domain-btn" data-cb07-domain="${escapeHtml(domain)}" aria-pressed="false">
          ${escapeHtml(label)}
        </button>
      `
    ),
  ].join('');

  const cardsHtml = CB07_TEMPLATES.map((tpl) => {
    const assembled = assembleBasicPrompt(tpl.fields);
    return `
      <article class="template-item" data-template-id="${escapeHtml(tpl.id)}" data-template-domain="${escapeHtml(tpl.domain)}">
        <span class="quiz-progress-badge">${escapeHtml(tpl.domainLabel)}</span>
        <h3 class="template-item__title">${escapeHtml(tpl.title)}</h3>
        <p class="template-item__desc">${escapeHtml(tpl.description)}</p>
        <p class="template-item__preview">${escapeHtml(assembled)}</p>
        <div class="template-item__actions">
          <button type="button" class="btn btn--primary" data-cb07-copy="${escapeHtml(tpl.id)}">
            Sao chép
          </button>
          <button type="button" class="btn btn--secondary" data-cb07-load="${escapeHtml(tpl.id)}">
            Tùy chỉnh trong Trợ lý
          </button>
          <span class="copy-feedback" data-cb07-feedback="${escapeHtml(tpl.id)}" role="status" aria-live="polite"></span>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section id="cb-07" class="card" aria-labelledby="cb07-title">
      <h2 id="cb07-title" class="card__title">Kho mẫu câu lệnh dùng ngay trong đời sống</h2>
      <p class="card__intro">
        Chọn nhóm nhu cầu bên dưới. Bạn có thể bấm <strong>Sao chép</strong> để dùng ngay, hoặc bấm <strong>Tùy chỉnh trong Trợ lý</strong> để sửa lại cho đúng hoàn cảnh gia đình mình.
      </p>

      <div class="template-domain-tabs" role="group" aria-label="Lọc mẫu theo lĩnh vực đời sống">
        ${domainButtonsHtml}
      </div>

      <div id="cb07-grid" class="template-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
}

export function createBasicTab(
  containerEl,
  { completedIds = [], onProgressChange, liveAnnouncerEl } = {}
) {
  if (!containerEl) {
    throw new Error('createBasicTab requires a valid containerEl');
  }

  const completedSet = new Set(Array.isArray(completedIds) ? completedIds : []);

  const wrapper = document.createElement('div');
  wrapper.className = 'stack';
  wrapper.setAttribute('data-basic-sections', 'true');

  wrapper.innerHTML = [
    renderCB01Section(completedSet),
    renderCB02Section(),
    renderCB03Section(),
  ].join('');

  const promptBuilder = createPromptBuilder({ liveAnnouncerEl });
  wrapper.appendChild(promptBuilder.element);

  wrapper.insertAdjacentHTML('beforeend', renderCB06Section() + renderCB07Section());

  containerEl.appendChild(wrapper);

  // Wire CB-01 Mini-Quiz
  const totalQuestions = CB01_INTRO.miniQuiz.length;
  const progressBadgeEl = wrapper.querySelector('[data-quiz-progress]');
  const quizCards = wrapper.querySelectorAll('.quiz-card');

  function updateQuizProgressDisplay() {
    const count = CB01_INTRO.miniQuiz.filter((item) =>
      completedSet.has(`cb01-quiz-${item.id}`)
    ).length;
    if (progressBadgeEl) {
      progressBadgeEl.textContent = `Đã trả lời: ${count}/${totalQuestions}`;
    }
  }

  quizCards.forEach((cardEl) => {
    const quizId = cardEl.getAttribute('data-quiz-id');
    const quizItem = CB01_INTRO.miniQuiz.find((q) => q.id === quizId);
    if (!quizItem) return;

    const optionButtons = cardEl.querySelectorAll('.quiz-option-btn');
    const feedbackEl = cardEl.querySelector('.quiz-card__feedback');

    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosenCanDo = btn.getAttribute('data-quiz-choice') === 'true';
        const isCorrect = chosenCanDo === quizItem.canDo;

        optionButtons.forEach((otherBtn) => {
          const isCurrent = otherBtn === btn;
          otherBtn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        cardEl.classList.remove('quiz-card--correct', 'quiz-card--incorrect');
        cardEl.classList.add(isCorrect ? 'quiz-card--correct' : 'quiz-card--incorrect');

        const statusPrefix = isCorrect ? 'Chính xác!' : 'Chưa đúng rồi, xem gợi ý nhé:';
        if (feedbackEl) {
          feedbackEl.hidden = false;
          feedbackEl.innerHTML = `
            <p class="quiz-card__feedback-status"><strong>${escapeHtml(
              statusPrefix
            )}</strong> ${escapeHtml(quizItem.explanation)}</p>
            <p class="quiz-card__feedback-tip">${escapeHtml(quizItem.tip)}</p>
          `;
        }

        const progressKey = `cb01-quiz-${quizItem.id}`;
        if (!completedSet.has(progressKey)) {
          completedSet.add(progressKey);
          updateQuizProgressDisplay();
          if (typeof onProgressChange === 'function') {
            onProgressChange(Array.from(completedSet));
          }
        }

        announce(liveAnnouncerEl, `${statusPrefix} ${quizItem.explanation}`);
      });
    });
  });

  // Wire CB-02 Privacy Guard
  const privacyInputEl = wrapper.querySelector('#cb02-privacy-input');
  const privacyCheckBtn = wrapper.querySelector('#cb02-privacy-check-btn');
  const privacyClearBtn = wrapper.querySelector('#cb02-privacy-clear-btn');
  const privacyResultEl = wrapper.querySelector('#cb02-privacy-result');

  if (privacyCheckBtn && privacyInputEl && privacyResultEl) {
    privacyCheckBtn.addEventListener('click', () => {
      const value = privacyInputEl.value;
      privacyResultEl.classList.remove(
        'privacy-guard-result--safe',
        'privacy-guard-result--warning',
        'privacy-guard-result--empty'
      );

      if (!value || value.trim() === '') {
        privacyResultEl.classList.add('privacy-guard-result--empty');
        privacyResultEl.innerHTML =
          '<p>Hãy dán hoặc gõ một đoạn chữ vào ô trên rồi bấm <strong>Kiểm tra ngay</strong>.</p>';
        announce(liveAnnouncerEl, 'Vui lòng nhập nội dung trước khi kiểm tra.');
        return;
      }

      const warnings = detectSensitiveInfo(value);
      if (warnings.length === 0) {
        privacyResultEl.classList.add('privacy-guard-result--safe');
        privacyResultEl.innerHTML =
          '<p><strong>An toàn:</strong> Chưa phát hiện thông tin nhạy cảm (CCCD, số điện thoại, thẻ ngân hàng, OTP, mật khẩu).</p>';
        announce(liveAnnouncerEl, 'An toàn: Chưa phát hiện thông tin nhạy cảm.');
      } else {
        privacyResultEl.classList.add('privacy-guard-result--warning');
        const listHtml = warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('');
        privacyResultEl.innerHTML = `
          <p><strong>Cần chú ý (${warnings.length} cảnh báo):</strong></p>
          <ul>${listHtml}</ul>
        `;
        announce(liveAnnouncerEl, `Phát hiện ${warnings.length} cảnh báo thông tin nhạy cảm.`);
      }
    });
  }

  if (privacyClearBtn && privacyInputEl && privacyResultEl) {
    privacyClearBtn.addEventListener('click', () => {
      privacyInputEl.value = '';
      privacyResultEl.className = 'privacy-guard-result';
      privacyResultEl.innerHTML = '';
      privacyInputEl.focus();
      announce(liveAnnouncerEl, 'Đã xóa nội dung kiểm tra.');
    });
  }

  // Wire CB-03 Interactive 4-Part Prompt Anatomy Diagram
  const anatomyButtons = wrapper.querySelectorAll('.anatomy-block');
  const anatomyDetailEl = wrapper.querySelector('#cb03-anatomy-detail');
  const previewSegments = wrapper.querySelectorAll('[data-preview-segment]');

  anatomyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedId = btn.getAttribute('data-anatomy-id');
      const block = CB03_PRINCIPLES.anatomyDiagram.find((item) => item.id === selectedId);
      if (!block) return;

      anatomyButtons.forEach((otherBtn) => {
        otherBtn.setAttribute('aria-pressed', otherBtn === btn ? 'true' : 'false');
      });

      previewSegments.forEach((segEl) => {
        const isMatch = segEl.getAttribute('data-preview-segment') === selectedId;
        segEl.classList.toggle('is-highlighted', isMatch);
      });

      if (anatomyDetailEl) {
        anatomyDetailEl.innerHTML = `
          <h4 class="anatomy-detail__title">${escapeHtml(block.label)} — ${escapeHtml(
          block.shortQuestion
        )}</h4>
          <p class="anatomy-detail__desc">${escapeHtml(block.description)}</p>
          <p class="anatomy-detail__example">
            <strong>Ví dụ câu chữ:</strong> "${escapeHtml(block.example)}"
          </p>
          <p class="anatomy-detail__why">
            <strong>Vì sao hữu ích:</strong> ${escapeHtml(block.whyItHelps)}
          </p>
        `;
      }

      announce(liveAnnouncerEl, `Đang xem ${block.label}: ${block.shortQuestion}`);
    });
  });

  // Wire CB-06 Before-vs-After Comparison Gallery
  let activeTopicId = CB06_COMPARISONS[0].id;
  let activeMode = 'vague';

  const cb06TopicBtns = wrapper.querySelectorAll('[data-cb06-topic]');
  const cb06ModeBtns = wrapper.querySelectorAll('[data-cb06-mode]');
  const cb06TopicHeadingEl = wrapper.querySelector('#cb06-topic-heading');
  const cb06VagueBoxEl = wrapper.querySelector('#cb06-vague-box');
  const cb06OptimizedBoxEl = wrapper.querySelector('#cb06-optimized-box');
  const cb06VaguePromptEl = wrapper.querySelector('#cb06-vague-prompt');
  const cb06VagueResponseEl = wrapper.querySelector('#cb06-vague-response');
  const cb06OptimizedPromptEl = wrapper.querySelector('#cb06-optimized-prompt');
  const cb06OptimizedResponseEl = wrapper.querySelector('#cb06-optimized-response');
  const cb06WhyTextEl = wrapper.querySelector('#cb06-why-text');
  const cb06LoadBtn = wrapper.querySelector('[data-cb06-load]');

  function renderCB06State() {
    const topic = CB06_COMPARISONS.find((item) => item.id === activeTopicId) || CB06_COMPARISONS[0];

    cb06TopicBtns.forEach((btn) => {
      const isSelected = btn.getAttribute('data-cb06-topic') === topic.id;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    cb06ModeBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-cb06-mode') === activeMode ? 'true' : 'false');
    });

    if (cb06TopicHeadingEl) cb06TopicHeadingEl.textContent = topic.title;
    if (cb06VaguePromptEl) cb06VaguePromptEl.textContent = topic.vaguePrompt;
    if (cb06VagueResponseEl) cb06VagueResponseEl.textContent = topic.vagueResponse;
    if (cb06OptimizedPromptEl) cb06OptimizedPromptEl.textContent = topic.optimizedPrompt;
    if (cb06OptimizedResponseEl) cb06OptimizedResponseEl.textContent = topic.optimizedResponse;
    if (cb06WhyTextEl) {
      cb06WhyTextEl.innerHTML = `<strong>Vì sao cách chuẩn tốt hơn:</strong> ${escapeHtml(topic.whyBetter)}`;
    }

    if (cb06VagueBoxEl) cb06VagueBoxEl.hidden = activeMode !== 'vague';
    if (cb06OptimizedBoxEl) cb06OptimizedBoxEl.hidden = activeMode !== 'optimized';
  }

  cb06TopicBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const nextId = btn.getAttribute('data-cb06-topic');
      if (!nextId) return;
      activeTopicId = nextId;
      renderCB06State();
      const topic = CB06_COMPARISONS.find((item) => item.id === activeTopicId);
      if (topic) {
        announce(liveAnnouncerEl, `Đang xem so sánh chủ đề: ${topic.topic}`);
      }
    });

    btn.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % cb06TopicBtns.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + cb06TopicBtns.length) % cb06TopicBtns.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = cb06TopicBtns.length - 1;
      }
      if (nextIndex === null) return;

      event.preventDefault();
      const nextBtn = cb06TopicBtns[nextIndex];
      const nextId = nextBtn?.getAttribute('data-cb06-topic');
      if (!nextId) return;
      activeTopicId = nextId;
      renderCB06State();
      nextBtn.focus();
      const topic = CB06_COMPARISONS.find((item) => item.id === activeTopicId);
      if (topic) {
        announce(liveAnnouncerEl, `Đang xem so sánh chủ đề: ${topic.topic}`);
      }
    });
  });

  cb06ModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextMode = btn.getAttribute('data-cb06-mode');
      if (!nextMode) return;
      activeMode = nextMode;
      renderCB06State();
      announce(
        liveAnnouncerEl,
        activeMode === 'optimized'
          ? 'Đang xem cách hỏi chuẩn 5 phần.'
          : 'Đang xem cách hỏi chung chung.'
      );
    });
  });

  if (cb06LoadBtn) {
    cb06LoadBtn.addEventListener('click', () => {
      const topic = CB06_COMPARISONS.find((item) => item.id === activeTopicId) || CB06_COMPARISONS[0];
      promptBuilder.setFields(topic.fields, { scrollToBuilder: true });
      announce(liveAnnouncerEl, `Đã đưa mẫu "${topic.title}" vào Trợ lý ghép câu lệnh.`);
    });
  }

  // Wire CB-07 Everyday Templates
  const cb07DomainBtns = wrapper.querySelectorAll('[data-cb07-domain]');
  const cb07Cards = wrapper.querySelectorAll('[data-template-id]');

  cb07DomainBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedDomain = btn.getAttribute('data-cb07-domain') || 'all';
      cb07DomainBtns.forEach((otherBtn) => {
        otherBtn.setAttribute('aria-pressed', otherBtn === btn ? 'true' : 'false');
      });

      let visibleCount = 0;
      cb07Cards.forEach((cardEl) => {
        const cardDomain = cardEl.getAttribute('data-template-domain');
        const shouldShow = selectedDomain === 'all' || cardDomain === selectedDomain;
        cardEl.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      announce(liveAnnouncerEl, `Đang hiển thị ${visibleCount} mẫu câu lệnh.`);
    });
  });

  const cb07GridEl = wrapper.querySelector('#cb07-grid');
  if (cb07GridEl) {
    cb07GridEl.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const copyTrigger = target.closest('[data-cb07-copy]');
      if (copyTrigger) {
        const tplId = copyTrigger.getAttribute('data-cb07-copy');
        const tpl = CB07_TEMPLATES.find((item) => item.id === tplId);
        if (!tpl) return;

        const promptText = assembleBasicPrompt(tpl.fields);
        const copied = await copyText(promptText, liveAnnouncerEl);
        const feedbackEl = wrapper.querySelector(`[data-cb07-feedback="${tpl.id}"]`);
        if (feedbackEl) {
          feedbackEl.textContent = copied ? 'Đã sao chép!' : 'Hãy bôi đen để sao chép.';
        }
        return;
      }

      const loadTrigger = target.closest('[data-cb07-load]');
      if (loadTrigger) {
        const tplId = loadTrigger.getAttribute('data-cb07-load');
        const tpl = CB07_TEMPLATES.find((item) => item.id === tplId);
        if (!tpl) return;

        promptBuilder.setFields(tpl.fields, { scrollToBuilder: true });
        announce(liveAnnouncerEl, `Đã đưa mẫu "${tpl.title}" vào Trợ lý ghép câu lệnh.`);
      }
    });
  }

  return {
    element: wrapper,
    promptBuilder,
  };
}
