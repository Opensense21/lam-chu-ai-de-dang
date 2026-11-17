import {
  NC01_CONCEPTS,
  NC02_SCENARIOS,
  NC04_TEMPLATES,
  NC05_SAFETY,
} from '../data/advanced-guides.js';
import { copyText } from '../utils/clipboard.js';
import { assembleSkillMarkdown, assembleWorkflowPrompt } from '../utils/skill-helpers.js';
import { createAgentSimulator } from './AgentSimulator.js';
import { createSkillBuilder } from './SkillBuilder.js';

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

function renderNC01Html() {
  const analogiesHtml = NC01_CONCEPTS.analogies
    .map(
      (item) => `
      <li class="adv-analogy-card">
        <p class="adv-analogy-card__metaphor">${escapeHtml(item.metaphor)}</p>
        <h3 class="adv-analogy-card__title">${escapeHtml(item.title)}</h3>
        <p class="adv-analogy-card__desc">${escapeHtml(item.plainDesc)}</p>
        <button
          type="button"
          class="glossary-chip"
          data-glossary-term="${escapeHtml(item.glossaryTerm)}"
        >
          Giải thích: ${escapeHtml(item.glossaryTerm.toUpperCase())}
        </button>
      </li>
    `
    )
    .join('');

  const tableRowsHtml = NC01_CONCEPTS.decisionTable
    .map(
      (row) => `
      <tr>
        <th scope="row">${escapeHtml(row.situation)}</th>
        <td><strong>${escapeHtml(row.choice)}</strong></td>
        <td>${escapeHtml(row.reason)}</td>
        <td>${escapeHtml(row.example)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <section id="nc-01" class="card" aria-labelledby="nc01-title">
      <h2 id="nc01-title" class="card__title">${escapeHtml(NC01_CONCEPTS.title)}</h2>
      <p class="card__intro">${escapeHtml(NC01_CONCEPTS.intro)}</p>

      <ul class="adv-analogy-grid" aria-label="Sơ đồ ví von 4 khái niệm nâng cao">
        ${analogiesHtml}
      </ul>

      <div class="adv-glossary-strip">
        <p class="adv-glossary-strip__label">
          <strong>Thuật ngữ cốt lõi phần Nâng cao</strong> (bấm để xem ví von dễ nhớ):
        </p>
        <div class="glossary-chip-list">
          <button type="button" class="glossary-chip" data-glossary-term="agent">Agent</button>
          <button type="button" class="glossary-chip" data-glossary-term="skill">Skill</button>
          <button type="button" class="glossary-chip" data-glossary-term="mcp">MCP</button>
          <button type="button" class="glossary-chip" data-glossary-term="plugin">Plugin</button>
        </div>
      </div>

      <h3 class="adv-subheading">Khi nào dùng cái nào?</h3>
      <div class="adv-table-wrap">
        <table class="adv-decision-table">
          <thead>
            <tr>
              <th scope="col">Nhu cầu của bạn</th>
              <th scope="col">Nên chọn</th>
              <th scope="col">Vì sao</th>
              <th scope="col">Ví dụ thực tế</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>

      <details class="adv-tech-details">
        <summary class="adv-tech-details__summary">Xem cấu hình kỹ thuật (JSON / CLI)</summary>
        <div class="adv-tech-details__body">
          <div class="adv-tech-block">
            <div class="adv-tech-block__head">
              <strong>Cấu hình MCP chỉ đọc (mcpServers JSON)</strong>
              <button type="button" class="btn btn--secondary" data-nc01-copy="mcp">
                Sao chép JSON
              </button>
            </div>
            <pre class="adv-code-block">${escapeHtml(NC01_CONCEPTS.technicalConfigs.mcpJson)}</pre>
          </div>
          <div class="adv-tech-block">
            <div class="adv-tech-block__head">
              <strong>Khung file kỹ năng chuẩn (SKILL.md)</strong>
              <button type="button" class="btn btn--secondary" data-nc01-copy="skill">
                Sao chép SKILL.md
              </button>
            </div>
            <pre class="adv-code-block">${escapeHtml(NC01_CONCEPTS.technicalConfigs.skillMd)}</pre>
          </div>
        </div>
      </details>
    </section>
  `;
}

function getTemplateCopyText(tpl) {
  if (tpl.mode === 'workflow') {
    return assembleWorkflowPrompt(tpl.fields);
  }
  return assembleSkillMarkdown(tpl.fields);
}

function renderNC04Html() {
  const cardsHtml = NC04_TEMPLATES.map((tpl) => {
    const modeLabel = tpl.mode === 'workflow' ? 'Workflow' : 'SKILL.md';
    return `
      <article class="adv-template-card" data-template-id="${escapeHtml(tpl.id)}">
        <div class="adv-template-card__meta">
          <span class="adv-domain-badge">${escapeHtml(tpl.domain)}</span>
          <span class="adv-mode-badge">${escapeHtml(modeLabel)}</span>
        </div>
        <h3 class="adv-template-card__title">${escapeHtml(tpl.title)}</h3>
        <p class="adv-template-card__summary">${escapeHtml(tpl.summary)}</p>

        <div class="adv-template-card__actions">
          <button
            type="button"
            class="btn btn--primary"
            data-nc04-copy="${escapeHtml(tpl.id)}"
          >
            Sao chép
          </button>
          <button
            type="button"
            class="btn btn--secondary"
            data-nc04-load="${escapeHtml(tpl.id)}"
          >
            Đưa vào Xưởng thiết kế
          </button>
          <span class="copy-feedback" data-nc04-feedback="${escapeHtml(tpl.id)}" aria-live="polite"></span>
        </div>

        <details class="adv-tech-details">
          <summary class="adv-tech-details__summary">Xem cấu hình kỹ thuật (JSON / CLI)</summary>
          <div class="adv-tech-details__body">
            <p class="adv-tech-label"><strong>Cấu hình JSON minh họa:</strong></p>
            <pre class="adv-code-block">${escapeHtml(tpl.technicalConfig.json)}</pre>
            <p class="adv-tech-label"><strong>Lệnh kiểm tra CLI:</strong></p>
            <pre class="adv-code-block">${escapeHtml(tpl.technicalConfig.cli)}</pre>
          </div>
        </details>
      </article>
    `;
  }).join('');

  return `
    <section id="nc-04" class="card" aria-labelledby="nc04-title">
      <h2 id="nc04-title" class="card__title">NC-04: Bộ mẫu thực tế dùng ngay</h2>
      <p class="card__intro">
        Chọn một mẫu có sẵn bên dưới để sao chép dùng ngay, hoặc bấm <strong>Đưa vào Xưởng thiết kế</strong> để chỉnh sửa lại theo ý gia đình bạn.
      </p>
      <div class="adv-template-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
}

function renderNC05Html(completedSet) {
  const { read, write } = NC05_SAFETY.permissionComparison;
  const hitl = NC05_SAFETY.humanInTheLoop;
  const injection = NC05_SAFETY.promptInjection;

  const totalChecks = NC05_SAFETY.preRunChecklist.length;
  const doneCount = NC05_SAFETY.preRunChecklist.filter((item) => completedSet.has(item.id)).length;

  const checklistHtml = NC05_SAFETY.preRunChecklist
    .map((item) => {
      const checked = completedSet.has(item.id);
      return `
        <li class="adv-checklist-item">
          <label class="adv-checklist-label">
            <input
              type="checkbox"
              class="adv-checklist-checkbox"
              data-nc05-check="${escapeHtml(item.id)}"
              ${checked ? 'checked' : ''}
            />
            <span class="adv-checklist-content">
              <strong>${escapeHtml(item.label)}</strong>
              <span class="adv-checklist-detail">${escapeHtml(item.detail)}</span>
            </span>
          </label>
        </li>
      `;
    })
    .join('');

  return `
    <section id="nc-05" class="card" aria-labelledby="nc05-title">
      <h2 id="nc05-title" class="card__title">${escapeHtml(NC05_SAFETY.title)}</h2>
      <p class="card__intro">${escapeHtml(NC05_SAFETY.intro)}</p>

      <div class="adv-safety-grid">
        <div class="adv-safety-box adv-safety-box--read">
          <span class="adv-safety-badge">${escapeHtml(read.badge)}</span>
          <h3 class="adv-safety-box__title">${escapeHtml(read.title)}</h3>
          <ul class="adv-safety-list">
            ${read.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        <div class="adv-safety-box adv-safety-box--write">
          <span class="adv-safety-badge">${escapeHtml(write.badge)}</span>
          <h3 class="adv-safety-box__title">${escapeHtml(write.title)}</h3>
          <ul class="adv-safety-list">
            ${write.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="adv-rule-box">
        <h3 class="adv-rule-box__title">${escapeHtml(hitl.title)}</h3>
        <p>${escapeHtml(hitl.explanation)}</p>
        <p class="adv-rule-box__highlight"><strong>${escapeHtml(hitl.rule)}</strong></p>
      </div>

      <div class="adv-warning-box">
        <h3 class="adv-warning-box__title">${escapeHtml(injection.title)}</h3>
        <p><strong>Ví von dễ hiểu:</strong> ${escapeHtml(injection.analogy)}</p>
        <p>${escapeHtml(injection.explanation)}</p>
        <p class="adv-warning-box__prevention"><strong>Cách phòng tránh:</strong> ${escapeHtml(injection.prevention)}</p>
      </div>

      <div class="adv-checklist-section">
        <div class="adv-checklist-header">
          <h3 class="adv-checklist-header__title">Bảng kiểm an toàn trước khi chạy Agent</h3>
          <span class="adv-checklist-counter" data-nc05-counter>
            Đã kiểm tra: ${doneCount}/${totalChecks}
          </span>
        </div>
        <ul class="adv-checklist-list">
          ${checklistHtml}
        </ul>
      </div>
    </section>
  `;
}

export function createAdvancedTab(
  containerEl,
  {
    completedIds = [],
    favorites = [],
    onProgressChange,
    onFavoritesChange,
    liveAnnouncerEl,
  } = {}
) {
  if (!containerEl) return null;

  const nc05IdsSet = new Set(NC05_SAFETY.preRunChecklist.map((item) => item.id));
  const completedSet = new Set(
    (Array.isArray(completedIds) ? completedIds : []).filter((id) => nc05IdsSet.has(id))
  );

  containerEl.innerHTML = `
    <div id="nc01-mount"></div>
    <div id="nc02-mount"></div>
    <div id="nc03-mount"></div>
    <div id="nc04-mount"></div>
    <div id="nc05-mount"></div>
  `;

  const nc01Mount = containerEl.querySelector('#nc01-mount');
  const nc02Mount = containerEl.querySelector('#nc02-mount');
  const nc03Mount = containerEl.querySelector('#nc03-mount');
  const nc04Mount = containerEl.querySelector('#nc04-mount');
  const nc05Mount = containerEl.querySelector('#nc05-mount');

  nc01Mount.innerHTML = renderNC01Html();

  const simulator = createAgentSimulator(nc02Mount, {
    scenarios: NC02_SCENARIOS,
    liveAnnouncerEl,
  });

  const skillBuilder = createSkillBuilder(nc03Mount, {
    favorites,
    onFavoritesChange,
    liveAnnouncerEl,
  });

  nc04Mount.innerHTML = renderNC04Html();
  nc05Mount.innerHTML = renderNC05Html(completedSet);

  // Wire NC-01 technical config copy buttons
  nc01Mount.addEventListener('click', async (event) => {
    const copyBtn = event.target.closest('[data-nc01-copy]');
    if (!copyBtn) return;
    const kind = copyBtn.getAttribute('data-nc01-copy');
    const text =
      kind === 'mcp'
        ? NC01_CONCEPTS.technicalConfigs.mcpJson
        : NC01_CONCEPTS.technicalConfigs.skillMd;
    await copyText(text, liveAnnouncerEl);
  });

  // Wire NC-04 template actions
  nc04Mount.addEventListener('click', async (event) => {
    const copyBtn = event.target.closest('[data-nc04-copy]');
    if (copyBtn) {
      const tplId = copyBtn.getAttribute('data-nc04-copy');
      const tpl = NC04_TEMPLATES.find((t) => t.id === tplId);
      if (!tpl) return;
      const text = getTemplateCopyText(tpl);
      const ok = await copyText(text, liveAnnouncerEl);
      const feedbackEl = nc04Mount.querySelector(`[data-nc04-feedback="${tplId}"]`);
      if (feedbackEl) {
        feedbackEl.textContent = ok ? 'Đã sao chép!' : 'Không thể tự sao chép.';
      }
      return;
    }

    const loadBtn = event.target.closest('[data-nc04-load]');
    if (loadBtn) {
      const tplId = loadBtn.getAttribute('data-nc04-load');
      const tpl = NC04_TEMPLATES.find((t) => t.id === tplId);
      if (tpl && skillBuilder) {
        skillBuilder.loadTemplate(tpl);
      }
    }
  });

  // Wire NC-05 checklist persistence
  nc05Mount.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-nc05-check]');
    if (!checkbox) return;
    const checkId = checkbox.getAttribute('data-nc05-check');
    if (!nc05IdsSet.has(checkId)) return;

    if (checkbox.checked) {
      completedSet.add(checkId);
    } else {
      completedSet.delete(checkId);
    }

    const counterEl = nc05Mount.querySelector('[data-nc05-counter]');
    if (counterEl) {
      counterEl.textContent = `Đã kiểm tra: ${completedSet.size}/${NC05_SAFETY.preRunChecklist.length}`;
    }

    if (typeof onProgressChange === 'function') {
      onProgressChange(Array.from(completedSet));
    }

    announce(
      liveAnnouncerEl,
      `Đã cập nhật bảng kiểm an toàn: ${completedSet.size} trên ${NC05_SAFETY.preRunChecklist.length} mục.`
    );
  });

  return {
    simulator,
    skillBuilder,
  };
}
