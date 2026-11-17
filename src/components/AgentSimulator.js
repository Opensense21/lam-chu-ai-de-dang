import { NC02_SCENARIOS } from '../data/advanced-guides.js';

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

const GLOSSARY_LABELS = {
  agent: 'Giải thích: Agent là gì?',
  skill: 'Giải thích: Skill là gì?',
  mcp: 'Giải thích: MCP là gì?',
  plugin: 'Giải thích: Plugin là gì?',
};

export function createAgentSimulator(
  containerEl,
  { scenarios = NC02_SCENARIOS, liveAnnouncerEl } = {}
) {
  const safeScenarios = Array.isArray(scenarios) && scenarios.length > 0 ? scenarios : NC02_SCENARIOS;

  let currentScenarioId = safeScenarios[0].id;
  let currentStepIndex = 0; // 0..4
  let permissionDecision = null; // null | 'allow' | 'deny'

  const rootEl = document.createElement('section');
  rootEl.id = 'nc-02';
  rootEl.className = 'card adv-simulator';
  rootEl.setAttribute('aria-labelledby', 'nc02-title');

  function getActiveScenario() {
    return safeScenarios.find((s) => s.id === currentScenarioId) || safeScenarios[0];
  }

  function render() {
    const scenario = getActiveScenario();
    const steps = scenario.steps || [];
    const activeStep = steps[currentStepIndex] || steps[0];
    const isPermissionStep = activeStep && activeStep.type === 'mcp' && Boolean(activeStep.permissionGate);
    const needsDecision = isPermissionStep && permissionDecision === null;
    const isLastStep = currentStepIndex >= steps.length - 1;
    const isFirstStep = currentStepIndex <= 0;

    const scenarioBtnsHtml = safeScenarios
      .map((item) => {
        const isSelected = item.id === scenario.id;
        return `
          <button
            type="button"
            class="btn adv-scenario-btn"
            data-sim-scenario="${escapeHtml(item.id)}"
            aria-pressed="${isSelected ? 'true' : 'false'}"
          >
            ${escapeHtml(item.title)}
          </button>
        `;
      })
      .join('');

    const stepperHtml = steps
      .map((step, idx) => {
        const isCurrent = idx === currentStepIndex;
        const isDone = idx < currentStepIndex;
        const stateClass = isCurrent
          ? 'adv-stepper__item--current'
          : isDone
            ? 'adv-stepper__item--done'
            : '';

        return `
          <li
            class="adv-stepper__item ${stateClass}"
            ${isCurrent ? 'aria-current="step"' : ''}
          >
            <button
              type="button"
              class="adv-stepper__btn"
              data-sim-step="${idx}"
              aria-label="Bước ${idx + 1}: ${escapeHtml(step.title)}"
            >
              <span class="adv-stepper__num" aria-hidden="true">${idx + 1}</span>
              <span class="adv-stepper__label">${escapeHtml(step.title)}</span>
            </button>
          </li>
        `;
      })
      .join('');

    let stepBodyText = activeStep ? activeStep.detail : '';
    let stepOutcomeBadge = '';

    if (
      activeStep &&
      (activeStep.type === 'plugin' || activeStep.type === 'result') &&
      permissionDecision === 'deny' &&
      activeStep.denyFallback
    ) {
      stepBodyText = activeStep.denyFallback;
      stepOutcomeBadge = `
        <p class="adv-sim-notice adv-sim-notice--warn">
          <strong>Chế độ bảo mật đang bật:</strong> Vì bạn đã từ chối cấp quyền đọc ở Bước 3, trợ lý tự động chuyển sang phương án an toàn không đụng tới dữ liệu riêng tư.
        </p>
      `;
    } else if (
      activeStep &&
      (activeStep.type === 'plugin' || activeStep.type === 'result') &&
      permissionDecision === 'allow'
    ) {
      stepOutcomeBadge = `
        <p class="adv-sim-notice adv-sim-notice--ok">
          <strong>Đang chạy với quyền Chỉ đọc (Read-only):</strong> Dữ liệu gốc được bảo vệ, không bị sửa hay xóa.
        </p>
      `;
    }

    let permissionGateHtml = '';
    if (isPermissionStep && activeStep.permissionGate) {
      const gate = activeStep.permissionGate;
      const allowPressed = permissionDecision === 'allow' ? 'true' : 'false';
      const denyPressed = permissionDecision === 'deny' ? 'true' : 'false';

      let outcomeHtml = `
        <p class="adv-gate__pending">
          Hãy chọn 1 trong 2 nút bên dưới để quyết định trước khi sang Bước 4.
        </p>
      `;

      if (permissionDecision === 'allow') {
        outcomeHtml = `
          <div class="adv-gate__outcome adv-gate__outcome--allow" role="status">
            <p><strong>Kết quả lựa chọn:</strong> ${escapeHtml(gate.allowOutcome)}</p>
          </div>
        `;
      } else if (permissionDecision === 'deny') {
        outcomeHtml = `
          <div class="adv-gate__outcome adv-gate__outcome--deny" role="status">
            <p><strong>Kết quả lựa chọn:</strong> ${escapeHtml(gate.denyOutcome)}</p>
          </div>
        `;
      }

      permissionGateHtml = `
        <div class="adv-permission-gate" role="region" aria-label="Cổng xin phép quyền truy cập dữ liệu">
          <h4 class="adv-permission-gate__title">Cổng kiểm soát quyền (Permission Gate)</h4>
          <p class="adv-permission-gate__prompt">${escapeHtml(gate.prompt)}</p>
          <div class="adv-permission-gate__actions">
            <button
              type="button"
              class="btn adv-gate-btn adv-gate-btn--allow"
              data-sim-permission="allow"
              aria-pressed="${allowPressed}"
            >
              ${escapeHtml(gate.allowLabel)}
            </button>
            <button
              type="button"
              class="btn adv-gate-btn adv-gate-btn--deny"
              data-sim-permission="deny"
              aria-pressed="${denyPressed}"
            >
              ${escapeHtml(gate.denyLabel)}
            </button>
          </div>
          ${outcomeHtml}
        </div>
      `;
    }

    const glossaryHtml =
      activeStep && activeStep.glossaryTerm
        ? `
          <div class="adv-sim-glossary">
            <button
              type="button"
              class="glossary-chip"
              data-glossary-term="${escapeHtml(activeStep.glossaryTerm)}"
            >
              ${escapeHtml(GLOSSARY_LABELS[activeStep.glossaryTerm] || `Xem thuật ngữ: ${activeStep.glossaryTerm}`)}
            </button>
          </div>
        `
        : '';

    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    let restoreSelector = null;
    if (activeEl && rootEl.contains(activeEl)) {
      if (activeEl.hasAttribute('data-sim-nav')) {
        restoreSelector = `[data-sim-nav="${activeEl.getAttribute('data-sim-nav')}"]`;
      } else if (activeEl.hasAttribute('data-sim-step')) {
        restoreSelector = `[data-sim-step="${activeEl.getAttribute('data-sim-step')}"]`;
      } else if (activeEl.hasAttribute('data-sim-permission')) {
        restoreSelector = `[data-sim-permission="${activeEl.getAttribute('data-sim-permission')}"]`;
      } else if (activeEl.hasAttribute('data-sim-scenario')) {
        restoreSelector = `[data-sim-scenario="${activeEl.getAttribute('data-sim-scenario')}"]`;
      } else if (activeEl.hasAttribute('data-glossary-term')) {
        restoreSelector = `[data-glossary-term="${activeEl.getAttribute('data-glossary-term')}"]`;
      }
    }

    rootEl.innerHTML = `
      <h2 id="nc02-title" class="card__title">NC-02: Mô phỏng từng bước Agent + Skill + MCP + Plugin</h2>
      <p class="card__intro">
        Chọn một tình huống đời thường bên dưới rồi bấm từng bước để xem cách trợ lý AI phối hợp và xin phép bạn trước khi đọc dữ liệu.
      </p>

      <div class="adv-scenario-picker" role="group" aria-label="Chọn tình huống mô phỏng">
        ${scenarioBtnsHtml}
      </div>

      <p class="adv-scenario-summary">
        <strong>Tình huống đang xem:</strong> ${escapeHtml(scenario.summary)}
      </p>

      <ol class="adv-stepper" aria-label="Tiến trình 5 bước của Agent">
        ${stepperHtml}
      </ol>

      <div class="adv-sim-stage" aria-live="polite">
        <div class="adv-sim-stage__header">
          <span class="adv-sim-badge">Bước ${currentStepIndex + 1} / ${steps.length}</span>
          <span class="adv-sim-actor">${escapeHtml(activeStep ? activeStep.actor : '')}</span>
        </div>
        <h3 class="adv-sim-stage__title">${escapeHtml(activeStep ? activeStep.title : '')}</h3>
        <p class="adv-sim-stage__detail">${escapeHtml(stepBodyText)}</p>
        ${stepOutcomeBadge}
        ${permissionGateHtml}
        ${glossaryHtml}
      </div>

      <div class="adv-sim-controls">
        <button
          type="button"
          class="btn btn--secondary"
          data-sim-nav="prev"
          ${isFirstStep ? 'disabled' : ''}
        >
          Bước trước
        </button>
        <button
          type="button"
          class="btn btn--primary"
          data-sim-nav="next"
          ${isLastStep || needsDecision ? 'disabled' : ''}
        >
          Bước tiếp theo
        </button>
        <button
          type="button"
          class="btn"
          data-sim-nav="reset"
        >
          Làm lại từ đầu
        </button>
      </div>
    `;

    if (restoreSelector) {
      const target = rootEl.querySelector(restoreSelector);
      if (target && !target.disabled && typeof target.focus === 'function') {
        target.focus();
      } else {
        const fallback =
          rootEl.querySelector('[data-sim-permission]:not([disabled])') ||
          rootEl.querySelector('[data-sim-nav]:not([disabled])') ||
          rootEl.querySelector('button:not([disabled])');
        if (fallback && typeof fallback.focus === 'function') {
          fallback.focus();
        }
      }
    }
  }

  function setScenario(scenarioId) {
    const exists = safeScenarios.some((s) => s.id === scenarioId);
    if (!exists) return;
    currentScenarioId = scenarioId;
    currentStepIndex = 0;
    permissionDecision = null;
    render();
    const scenario = getActiveScenario();
    announce(liveAnnouncerEl, `Đã chuyển sang tình huống: ${scenario.title}, Bước 1.`);
  }

  function reset() {
    currentStepIndex = 0;
    permissionDecision = null;
    render();
    const scenario = getActiveScenario();
    announce(liveAnnouncerEl, `Đã đặt lại mô phỏng "${scenario.title}" về Bước 1.`);
  }

  rootEl.addEventListener('click', (event) => {
    const scenarioBtn = event.target.closest('[data-sim-scenario]');
    if (scenarioBtn) {
      const nextId = scenarioBtn.getAttribute('data-sim-scenario');
      setScenario(nextId);
      return;
    }

    const permissionBtn = event.target.closest('[data-sim-permission]');
    if (permissionBtn) {
      const decision = permissionBtn.getAttribute('data-sim-permission');
      if (decision === 'allow' || decision === 'deny') {
        permissionDecision = decision;
        render();
        const label =
          decision === 'allow'
            ? 'Đã chọn Cho phép đọc (Read-only). Bạn có thể bấm Bước tiếp theo.'
            : 'Đã chọn Từ chối để bảo mật. Bạn có thể bấm Bước tiếp theo để xem cách AI xử lý an toàn.';
        announce(liveAnnouncerEl, label);
      }
      return;
    }

    const stepBtn = event.target.closest('[data-sim-step]');
    if (stepBtn) {
      const targetIdx = Number(stepBtn.getAttribute('data-sim-step'));
      const scenario = getActiveScenario();
      const maxIdx = (scenario.steps || []).length - 1;
      if (Number.isInteger(targetIdx) && targetIdx >= 0 && targetIdx <= maxIdx) {
        // Prevent jumping past Step 3 (index 2) without a permission decision
        if (targetIdx > 2 && permissionDecision === null) {
          currentStepIndex = 2;
          render();
          announce(
            liveAnnouncerEl,
            'Bạn cần chọn Cho phép hoặc Từ chối ở Bước 3 trước khi xem Bước 4 và Bước 5.'
          );
          return;
        }
        currentStepIndex = targetIdx;
        render();
        const step = scenario.steps[currentStepIndex];
        announce(liveAnnouncerEl, `Đang xem Bước ${currentStepIndex + 1}: ${step.title}.`);
      }
      return;
    }

    const navBtn = event.target.closest('[data-sim-nav]');
    if (navBtn) {
      const action = navBtn.getAttribute('data-sim-nav');
      const scenario = getActiveScenario();
      const steps = scenario.steps || [];

      if (action === 'prev' && currentStepIndex > 0) {
        currentStepIndex -= 1;
        render();
        announce(
          liveAnnouncerEl,
          `Quay lại Bước ${currentStepIndex + 1}: ${steps[currentStepIndex].title}.`
        );
      } else if (action === 'next' && currentStepIndex < steps.length - 1) {
        const activeStep = steps[currentStepIndex];
        if (activeStep && activeStep.type === 'mcp' && activeStep.permissionGate && permissionDecision === null) {
          announce(
            liveAnnouncerEl,
            'Vui lòng chọn Cho phép đọc hoặc Từ chối để bảo mật ở Bước 3 trước.'
          );
          return;
        }
        currentStepIndex += 1;
        render();
        announce(
          liveAnnouncerEl,
          `Chuyển sang Bước ${currentStepIndex + 1}: ${steps[currentStepIndex].title}.`
        );
      } else if (action === 'reset') {
        reset();
      }
    }
  });

  render();

  if (containerEl) {
    containerEl.innerHTML = '';
    containerEl.appendChild(rootEl);
  }

  return {
    element: rootEl,
    setScenario,
    reset,
  };
}
