import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assembleSkillMarkdown,
  assembleWorkflowPrompt,
  evaluateSkillSpec,
  createSavedSkillItem,
  serializeSavedSkill,
  parseSavedSkill,
} from '../../src/utils/skill-helpers.js';
import {
  NC01_CONCEPTS,
  NC02_SCENARIOS,
  NC04_TEMPLATES,
  NC05_SAFETY,
} from '../../src/data/advanced-guides.js';

test('assembleSkillMarkdown returns empty string when all fields are empty', () => {
  assert.equal(assembleSkillMarkdown(), '');
  assert.equal(assembleSkillMarkdown(null), '');
  assert.equal(assembleSkillMarkdown({ name: '   ', trigger: '', steps: [], tools: '', safety: '' }), '');
});

test('assembleSkillMarkdown formats YAML frontmatter and 4 Vietnamese sections', () => {
  const md = assembleSkillMarkdown({
    name: 'tom-tat-hop',
    trigger: 'Khi tôi dán biên bản cuộc họp.',
    steps: ['1. Lọc quyết định chính.', '2. Liệt kê việc cần làm.'],
    tools: 'Chỉ đọc văn bản người dùng dán vào.',
    safety: 'Không tự ý gửi email.',
  });

  assert.ok(md.startsWith('---\n'));
  assert.ok(md.includes('name: tom-tat-hop'));
  assert.ok(md.includes('description: Khi tôi dán biên bản cuộc họp.'));
  assert.ok(md.includes('## Khi nào dùng'));
  assert.ok(md.includes('## Các bước thực hiện\n1. Lọc quyết định chính.\n2. Liệt kê việc cần làm.'));
  assert.ok(md.includes('## Công cụ & Kết nối (MCP / Plugin)'));
  assert.ok(md.includes('## Quy tắc an toàn'));
});

test('assembleWorkflowPrompt returns empty string when all fields are empty', () => {
  assert.equal(assembleWorkflowPrompt(), '');
  assert.equal(assembleWorkflowPrompt(null), '');
  assert.equal(assembleWorkflowPrompt({ name: '', input: '  ', steps: '', checkpoint: '', output: '' }), '');
});

test('assembleWorkflowPrompt formats multi-step Agent Workflow prompt with Vietnamese sections', () => {
  const prompt = assembleWorkflowPrompt({
    name: 'Gom hóa đơn tháng',
    input: 'Các file hóa đơn điện nước trong thư mục Chỉ đọc.',
    steps: '1. Đọc số tiền.\n2. Cộng tổng.',
    checkpoint: 'Dừng lại chờ tôi kiểm tra bảng nháp.',
    output: 'Bảng tổng hợp chi tiêu tháng.',
  });

  assert.ok(prompt.includes('# Quy trình Agent: Gom hóa đơn tháng'));
  assert.ok(prompt.includes('## Dữ liệu đầu vào'));
  assert.ok(prompt.includes('## Các bước thực hiện'));
  assert.ok(prompt.includes('## Điểm dừng xác nhận (Human-in-the-Loop)'));
  assert.ok(prompt.includes('## Kết quả đầu ra'));
});

test('evaluateSkillSpec scores 0..100 across 5 checks for skill and workflow modes', () => {
  const emptySkill = evaluateSkillSpec('skill', {});
  assert.equal(emptySkill.score, 0);
  assert.equal(emptySkill.checks.length, 5);
  assert.equal(emptySkill.privacyWarnings.length, 0);

  const fullSkill = evaluateSkillSpec('skill', {
    name: 'tom-tat-hop',
    trigger: 'Khi tôi dán ghi chép cuộc họp.',
    steps: '1. Đọc kỹ.\n2. Tóm tắt ngắn gọn.',
    tools: 'Chỉ đọc văn bản.',
    safety: 'Không tự ý gửi thư.',
  });
  assert.equal(fullSkill.score, 100);
  assert.ok(fullSkill.checks.every((c) => c.passed));

  const partialWorkflow = evaluateSkillSpec('workflow', {
    name: 'Lên lịch du lịch',
    input: 'Điểm đến và số ngày đi.',
    steps: '1. Chọn giờ đi.\n2. Chọn điểm tham quan.',
  });
  assert.equal(partialWorkflow.score, 60);
  assert.equal(partialWorkflow.checks.filter((c) => c.passed).length, 3);
});

test('evaluateSkillSpec detects sensitive personal info across fields via Privacy Guard', () => {
  const result = evaluateSkillSpec('workflow', {
    name: 'Kiểm tra tài khoản',
    input: 'Số CCCD 079123456789 và số điện thoại 0912345678.',
    steps: '1. Nhập mã OTP để đăng nhập.',
    checkpoint: 'Hỏi lại trước khi gửi.',
    output: 'Báo cáo.',
  });

  assert.ok(result.privacyWarnings.length >= 3);
  assert.ok(result.privacyWarnings.some((w) => w.includes('CCCD')));
  assert.ok(result.privacyWarnings.some((w) => w.includes('điện thoại')));
  assert.ok(result.privacyWarnings.some((w) => w.includes('OTP')));
});

test('createSavedSkillItem, serializeSavedSkill, and parseSavedSkill round-trip cleanly', () => {
  const item = createSavedSkillItem('skill', {
    name: 'mau-chao-buoi-sang',
    trigger: 'Mỗi sáng 7 giờ',
    steps: '1. Tóm tắt thời tiết.\n2. Gợi ý mặc áo.',
    tools: 'MCP thời tiết chỉ đọc',
    safety: 'Không lưu vị trí chính xác',
  });

  assert.ok(item.id.startsWith('saved-skill-'));
  assert.equal(item.mode, 'skill');
  assert.equal(item.title, 'mau-chao-buoi-sang');
  assert.ok(item.markdown.includes('## Khi nào dùng'));

  const serialized = serializeSavedSkill(item);
  assert.ok(serialized.startsWith('skill_v1:'));

  const parsed = parseSavedSkill(serialized);
  assert.deepEqual(parsed.fields, item.fields);
  assert.equal(parsed.id, item.id);
  assert.equal(parsed.mode, 'skill');
  assert.equal(parsed.title, 'mau-chao-buoi-sang');
});

test('parseSavedSkill rejects non-skill strings and malformed payloads safely', () => {
  assert.equal(parseSavedSkill(null), null);
  assert.equal(parseSavedSkill(''), null);
  assert.equal(parseSavedSkill('basic-favorite-123'), null);
  assert.equal(parseSavedSkill('skill_v1:{not-valid-json'), null);
  assert.equal(parseSavedSkill('skill_v1:{"id":"1","mode":"invalid","title":"x","fields":{}}'), null);
});

test('advanced-guides.js data satisfies M4 structural contracts', () => {
  assert.equal(NC01_CONCEPTS.analogies.length, 4);
  for (const item of NC01_CONCEPTS.analogies) {
    assert.ok(item.id && item.title && item.metaphor && item.plainDesc && item.glossaryTerm);
  }
  assert.ok(NC01_CONCEPTS.decisionTable.length >= 4);
  const parsedMcp = JSON.parse(NC01_CONCEPTS.technicalConfigs.mcpJson);
  assert.ok(parsedMcp.mcpServers);
  assert.ok(NC01_CONCEPTS.technicalConfigs.skillMd.startsWith('---'));

  assert.equal(NC02_SCENARIOS.length, 3);
  for (const scenario of NC02_SCENARIOS) {
    assert.equal(scenario.steps.length, 5);
    assert.equal(scenario.steps[0].type, 'goal');
    assert.equal(scenario.steps[1].type, 'skill');
    assert.equal(scenario.steps[2].type, 'mcp');
    assert.ok(scenario.steps[2].permissionGate);
    assert.equal(scenario.steps[2].permissionGate.allowLabel, 'Cho phép đọc (Read-only)');
    assert.equal(scenario.steps[2].permissionGate.denyLabel, 'Từ chối để bảo mật');
    assert.equal(scenario.steps[3].type, 'plugin');
    assert.ok(scenario.steps[3].denyFallback);
    assert.equal(scenario.steps[4].type, 'result');
    assert.ok(scenario.steps[4].denyFallback);
  }

  assert.equal(NC04_TEMPLATES.length, 4);
  assert.ok(NC04_TEMPLATES.some((t) => t.mode === 'skill'));
  assert.ok(NC04_TEMPLATES.some((t) => t.mode === 'workflow'));
  for (const tpl of NC04_TEMPLATES) {
    assert.ok(tpl.id && tpl.title && tpl.domain && tpl.summary && tpl.fields);
    assert.ok(tpl.technicalConfig && tpl.technicalConfig.json && tpl.technicalConfig.cli);
    JSON.parse(tpl.technicalConfig.json);
    assert.equal(evaluateSkillSpec(tpl.mode, tpl.fields).privacyWarnings.length, 0);
  }

  assert.equal(NC05_SAFETY.preRunChecklist.length, 4);
  assert.deepEqual(
    NC05_SAFETY.preRunChecklist.map((c) => c.id),
    ['nc05-check-1', 'nc05-check-2', 'nc05-check-3', 'nc05-check-4']
  );
});
