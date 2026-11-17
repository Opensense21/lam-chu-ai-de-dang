import { detectSensitiveInfo } from './prompt-helpers.js';

export const SAVED_SKILL_PREFIX = 'skill_v1:';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSteps(steps) {
  if (Array.isArray(steps)) {
    return steps
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .join('\n');
  }
  return normalizeText(steps);
}

/**
 * Formats a SKILL.md specification with YAML frontmatter and 4 Vietnamese sections.
 * Returns '' when all fields are empty.
 */
export function assembleSkillMarkdown(fields = {}) {
  const safeFields = fields && typeof fields === 'object' ? fields : {};
  const { name, trigger, steps, tools, safety } = safeFields;
  const cleanName = normalizeText(name);
  const cleanTrigger = normalizeText(trigger);
  const cleanSteps = normalizeSteps(steps);
  const cleanTools = normalizeText(tools);
  const cleanSafety = normalizeText(safety);

  if (!cleanName && !cleanTrigger && !cleanSteps && !cleanTools && !cleanSafety) {
    return '';
  }

  const frontmatterName = cleanName || 'ky-nang-moi';
  const frontmatterDesc = cleanTrigger || 'Quy trình mẫu hướng dẫn trợ lý AI làm việc theo chuẩn.';

  const lines = [
    '---',
    `name: ${frontmatterName}`,
    `description: ${frontmatterDesc}`,
    '---',
    '',
    '## Khi nào dùng',
    cleanTrigger || '(Chưa điền điều kiện kích hoạt kỹ năng)',
    '',
    '## Các bước thực hiện',
    cleanSteps || '(Chưa điền các bước thực hiện)',
    '',
    '## Công cụ & Kết nối (MCP / Plugin)',
    cleanTools || 'Không cần kết nối ngoài (chỉ xử lý văn bản người dùng cung cấp).',
    '',
    '## Quy tắc an toàn',
    cleanSafety || 'Luôn hỏi xác nhận trước khi lưu file, chỉnh sửa dữ liệu hoặc gửi tin nhắn.',
  ];

  return lines.join('\n');
}

/**
 * Formats a multi-step Agent Workflow prompt with Vietnamese sections.
 * Returns '' when all fields are empty.
 */
export function assembleWorkflowPrompt(fields = {}) {
  const safeFields = fields && typeof fields === 'object' ? fields : {};
  const { name, input, steps, checkpoint, output } = safeFields;
  const cleanName = normalizeText(name);
  const cleanInput = normalizeText(input);
  const cleanSteps = normalizeSteps(steps);
  const cleanCheckpoint = normalizeText(checkpoint);
  const cleanOutput = normalizeText(output);

  if (!cleanName && !cleanInput && !cleanSteps && !cleanCheckpoint && !cleanOutput) {
    return '';
  }

  const lines = [
    `# Quy trình Agent: ${cleanName || 'Quy trình nhiều bước'}`,
    '',
    '## Dữ liệu đầu vào',
    cleanInput || '(Chưa mô tả dữ liệu đầu vào)',
    '',
    '## Các bước thực hiện',
    cleanSteps || '(Chưa điền các bước thực hiện)',
    '',
    '## Điểm dừng xác nhận (Human-in-the-Loop)',
    cleanCheckpoint || 'Dừng lại hiển thị bản nháp để tôi kiểm tra và xác nhận trước khi thực hiện bước cuối.',
    '',
    '## Kết quả đầu ra',
    cleanOutput || '(Chưa mô tả kết quả đầu ra mong muốn)',
  ];

  return lines.join('\n');
}

function collectFieldTexts(fields) {
  if (!fields || typeof fields !== 'object') return [];
  const texts = [];
  for (const val of Object.values(fields)) {
    if (typeof val === 'string' && val.trim()) {
      texts.push(val);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === 'string' && item.trim()) {
          texts.push(item);
        }
      }
    }
  }
  return texts;
}

/**
 * Evaluates readiness (0..100 across 5 checks x 20 pts) and runs Privacy Guard
 * across all fields for either 'skill' or 'workflow' mode.
 */
export function evaluateSkillSpec(mode, fields = {}) {
  const safeFields = fields && typeof fields === 'object' ? fields : {};
  const isWorkflow = mode === 'workflow';

  const checks = isWorkflow
    ? [
        {
          id: 'wf-name',
          label: 'Có tên quy trình rõ ràng',
          passed: normalizeText(safeFields.name).length >= 3,
          tip: 'Đặt tên ngắn gọn để dễ nhớ (ví dụ: Gom hóa đơn tháng).',
        },
        {
          id: 'wf-input',
          label: 'Nêu rõ dữ liệu đầu vào',
          passed: normalizeText(safeFields.input).length >= 6,
          tip: 'Cho biết AI sẽ đọc tài liệu hay thông tin gì ở bước đầu.',
        },
        {
          id: 'wf-steps',
          label: 'Chia các bước thực hiện cụ thể',
          passed: normalizeSteps(safeFields.steps).length >= 10,
          tip: 'Viết từng bước 1, 2, 3 để trợ lý làm lần lượt không bị sót.',
        },
        {
          id: 'wf-checkpoint',
          label: 'Có điểm dừng xác nhận (Human-in-the-Loop)',
          passed: normalizeText(safeFields.checkpoint).length >= 6,
          tip: 'Ghi rõ bước nào AI phải dừng lại chờ bạn duyệt trước khi gửi hoặc lưu.',
        },
        {
          id: 'wf-output',
          label: 'Mô tả rõ kết quả đầu ra mong muốn',
          passed: normalizeText(safeFields.output).length >= 6,
          tip: 'Ví dụ: Bảng tổng hợp 4 nhóm chi tiêu, chữ ngắn gọn.',
        },
      ]
    : [
        {
          id: 'sk-name',
          label: 'Có tên kỹ năng dễ nhận diện',
          passed: normalizeText(safeFields.name).length >= 3,
          tip: 'Đặt tên ngắn gọn không dấu hoặc có dấu rõ ràng (ví dụ: tom-tat-bien-ban).',
        },
        {
          id: 'sk-trigger',
          label: 'Nêu rõ khi nào dùng kỹ năng này',
          passed: normalizeText(safeFields.trigger).length >= 6,
          tip: 'Mô tả tình huống kích hoạt (ví dụ: Khi tôi dán biên bản cuộc họp).',
        },
        {
          id: 'sk-steps',
          label: 'Có các bước hướng dẫn chi tiết',
          passed: normalizeSteps(safeFields.steps).length >= 10,
          tip: 'Liệt kê 2–4 bước cụ thể để AI làm đúng chuẩn mỗi lần.',
        },
        {
          id: 'sk-tools',
          label: 'Xác định công cụ / quyền kết nối (MCP / Plugin)',
          passed: normalizeText(safeFields.tools).length >= 5,
          tip: 'Nêu rõ chỉ đọc văn bản hay cần kết nối MCP ở chế độ Read-only.',
        },
        {
          id: 'sk-safety',
          label: 'Có quy tắc an toàn bảo vệ dữ liệu',
          passed: normalizeText(safeFields.safety).length >= 6,
          tip: 'Ví dụ: Không tự ý gửi email hoặc suy đoán số liệu không có thật.',
        },
      ];

  const score = checks.reduce((sum, check) => sum + (check.passed ? 20 : 0), 0);

  const warningSet = new Set();
  for (const text of collectFieldTexts(safeFields)) {
    for (const warning of detectSensitiveInfo(text)) {
      warningSet.add(warning);
    }
  }

  return {
    score,
    checks,
    privacyWarnings: Array.from(warningSet),
  };
}

/**
 * Creates a structured saved skill/workflow item ready for serialization.
 */
export function createSavedSkillItem(mode, fields = {}, markdown = '') {
  const normalizedMode = mode === 'workflow' ? 'workflow' : 'skill';
  const safeFields = fields && typeof fields === 'object' ? { ...fields } : {};
  const title =
    normalizeText(safeFields.name) ||
    (normalizedMode === 'workflow' ? 'Quy trình chưa đặt tên' : 'Kỹ năng chưa đặt tên');

  const computedMarkdown =
    normalizeText(markdown) ||
    (normalizedMode === 'workflow'
      ? assembleWorkflowPrompt(safeFields)
      : assembleSkillMarkdown(safeFields));

  const randomSuffix = Math.random().toString(36).slice(2, 7);

  return {
    id: `saved-${normalizedMode}-${Date.now()}-${randomSuffix}`,
    mode: normalizedMode,
    title,
    fields: safeFields,
    markdown: computedMarkdown,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Serializes a saved skill item into a string with 'skill_v1:' prefix
 * so storage.js (which stores string favorites) can persist it cleanly.
 */
export function serializeSavedSkill(item) {
  if (!item || typeof item !== 'object') return '';
  try {
    return `${SAVED_SKILL_PREFIX}${JSON.stringify(item)}`;
  } catch {
    return '';
  }
}

/**
 * Parses a 'skill_v1:' serialized string back into a saved skill item,
 * or returns null for non-skill strings / corrupted JSON.
 */
export function parseSavedSkill(raw) {
  if (typeof raw !== 'string' || !raw.startsWith(SAVED_SKILL_PREFIX)) {
    return null;
  }

  const jsonPart = raw.slice(SAVED_SKILL_PREFIX.length);
  if (!jsonPart) return null;

  try {
    const parsed = JSON.parse(jsonPart);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    if (
      typeof parsed.id !== 'string' ||
      (parsed.mode !== 'skill' && parsed.mode !== 'workflow') ||
      typeof parsed.title !== 'string' ||
      !parsed.fields ||
      typeof parsed.fields !== 'object'
    ) {
      return null;
    }
    return {
      id: parsed.id,
      mode: parsed.mode,
      title: parsed.title,
      fields: parsed.fields,
      markdown: typeof parsed.markdown === 'string' ? parsed.markdown : '',
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
    };
  } catch {
    return null;
  }
}
