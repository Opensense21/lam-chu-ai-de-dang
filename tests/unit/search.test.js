import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeVietnamese,
  buildSearchIndex,
  searchItems,
  QUICK_START_GOALS,
} from '../../src/utils/search.js';
import { CB07_TEMPLATES } from '../../src/data/basic-guides.js';
import { NC02_SCENARIOS, NC04_TEMPLATES } from '../../src/data/advanced-guides.js';

test('normalizeVietnamese strips diacritics, maps đ/Đ to d, lowercases, and collapses whitespace', () => {
  assert.equal(normalizeVietnamese('Làm Chủ AI Dễ Dàng'), 'lam chu ai de dang');
  assert.equal(normalizeVietnamese('Đọc hóa đơn trên Drive'), 'doc hoa don tren drive');
  assert.equal(normalizeVietnamese('  ĐÂY   LÀ   TIẾNG   VIỆT  '), 'day la tieng viet');
  assert.equal(
    normalizeVietnamese('áàảãạ ăắằẳẵặ âấầẩẫậ éèẻẽẹ êếềểễệ íìỉĩị óòỏõọ ôốồổỗộ ơớờởỡợ úùủũụ ưứừửữự ýỳỷỹỵ'),
    'aaaaa aaaaaa aaaaaa eeeee eeeeee iiiii ooooo oooooo oooooo uuuuu uuuuuu yyyyy'
  );
  assert.equal(normalizeVietnamese('SKILL.md — Tóm tắt!'), 'skill.md — tom tat!');
});

test('normalizeVietnamese safely handles non-string inputs', () => {
  assert.equal(normalizeVietnamese(null), '');
  assert.equal(normalizeVietnamese(undefined), '');
  assert.equal(normalizeVietnamese(12345), '');
  assert.equal(normalizeVietnamese({}), '');
  assert.equal(normalizeVietnamese([]), '');
  assert.equal(normalizeVietnamese('   '), '');
});

test('buildSearchIndex indexes all Basic & Advanced sections, CB-07 templates, NC-02 scenarios, and NC-04 templates', () => {
  const index = buildSearchIndex();
  assert.equal(
    index.length,
    7 + CB07_TEMPLATES.length + 5 + NC02_SCENARIOS.length + NC04_TEMPLATES.length
  );

  for (let i = 1; i <= 7; i += 1) {
    const sectionId = `cb-0${i}`;
    const found = index.find((item) => item.type === 'section' && item.sectionId === sectionId);
    assert.ok(found, `Missing basic section ${sectionId}`);
    assert.equal(found.tab, 'basic');
    assert.equal(found.tabLabel, 'Cơ bản');
    assert.equal(found.targetSelector, `#${sectionId}`);
  }

  for (const tpl of CB07_TEMPLATES) {
    const found = index.find(
      (item) => item.sectionId === 'cb-07' && item.templateId === tpl.id
    );
    assert.ok(found, `Missing CB-07 template ${tpl.id}`);
    assert.equal(found.tab, 'basic');
    assert.equal(found.targetSelector, `[data-template-id="${tpl.id}"]`);
  }

  for (let i = 1; i <= 5; i += 1) {
    const sectionId = `nc-0${i}`;
    const found = index.find((item) => item.type === 'section' && item.sectionId === sectionId);
    assert.ok(found, `Missing advanced section ${sectionId}`);
    assert.equal(found.tab, 'advanced');
    assert.equal(found.tabLabel, 'Nâng cao');
    assert.equal(found.targetSelector, `#${sectionId}`);
  }

  for (const sc of NC02_SCENARIOS) {
    const found = index.find(
      (item) => item.sectionId === 'nc-02' && item.scenarioId === sc.id
    );
    assert.ok(found, `Missing NC-02 scenario ${sc.id}`);
    assert.equal(found.tab, 'advanced');
  }

  for (const tpl of NC04_TEMPLATES) {
    const found = index.find(
      (item) => item.sectionId === 'nc-04' && item.templateId === tpl.id
    );
    assert.ok(found, `Missing NC-04 template ${tpl.id}`);
    assert.equal(found.tab, 'advanced');
    assert.equal(found.targetSelector, `[data-template-id="${tpl.id}"]`);
  }
});

test('searchItems returns empty array for empty, whitespace, or non-matching queries', () => {
  const index = buildSearchIndex();
  assert.deepEqual(searchItems('', index), []);
  assert.deepEqual(searchItems('   \t\n ', index), []);
  assert.deepEqual(searchItems(null, index), []);
  assert.deepEqual(searchItems('khongcochuoinay12345', index), []);
});

test('searchItems matches Vietnamese queries with and without diacritics', () => {
  const index = buildSearchIndex();
  const withoutDiacritics = searchItems('suc khoe', index);
  const withDiacritics = searchItems('sức khỏe', index);

  assert.ok(withoutDiacritics.length > 0);
  assert.deepEqual(
    withoutDiacritics.map((i) => i.id),
    withDiacritics.map((i) => i.id)
  );

  const driveResults = searchItems('hoa don drive', index);
  assert.ok(driveResults.some((item) => item.scenarioId === 'drive-invoices'));

  const dResults = searchItems('doc hoa don', index);
  assert.ok(dResults.length > 0);
});

test('searchItems ranks title matches above keyword matches and description matches', () => {
  const customItems = [
    {
      id: 'desc-only',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      title: 'Hướng dẫn chung',
      description: 'Có nhắc đến chữ thực đơn ở phần mô tả.',
      keywords: 'tong quan',
    },
    {
      id: 'kw-only',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      title: 'Gợi ý món ăn',
      description: 'Mô tả ngắn.',
      keywords: 'thuc don dinh duong',
    },
    {
      id: 'title-match',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      title: 'Thực đơn hằng ngày',
      description: 'Mô tả ngắn.',
      keywords: 'mon an',
    },
  ];

  const results = searchItems('thuc don', customItems);
  assert.deepEqual(
    results.map((item) => item.id),
    ['title-match', 'kw-only', 'desc-only']
  );
});

test('QUICK_START_GOALS provides 6 valid goal chips across Basic and Advanced tabs', () => {
  assert.equal(QUICK_START_GOALS.length, 6);

  const byLabel = new Map(QUICK_START_GOALS.map((g) => [g.label, g]));

  assert.equal(byLabel.get('Viết thư / Email')?.tab, 'basic');
  assert.equal(byLabel.get('Viết thư / Email')?.templateId, 'tpl-msg-thanks');
  assert.equal(
    byLabel.get('Viết thư / Email')?.targetSelector,
    '[data-template-id="tpl-msg-thanks"]'
  );

  assert.equal(byLabel.get('Hỏi sức khỏe')?.tab, 'basic');
  assert.equal(byLabel.get('Hỏi sức khỏe')?.templateId, 'tpl-health-terms');

  assert.equal(byLabel.get('Tóm tắt tin')?.tab, 'basic');
  assert.equal(byLabel.get('Tóm tắt tin')?.templateId, 'tpl-sum-article');

  assert.equal(byLabel.get('Ghép câu lệnh chuẩn')?.tab, 'basic');
  assert.equal(byLabel.get('Ghép câu lệnh chuẩn')?.sectionId, 'cb-04');
  assert.equal(byLabel.get('Ghép câu lệnh chuẩn')?.targetSelector, '#cb-04');

  assert.equal(byLabel.get('Kết nối Drive / Lịch (MCP)')?.tab, 'advanced');
  assert.equal(byLabel.get('Kết nối Drive / Lịch (MCP)')?.sectionId, 'nc-02');
  assert.equal(byLabel.get('Kết nối Drive / Lịch (MCP)')?.scenarioId, 'drive-invoices');

  assert.equal(byLabel.get('Tạo Skill tự động')?.tab, 'advanced');
  assert.equal(byLabel.get('Tạo Skill tự động')?.sectionId, 'nc-03');
  assert.equal(byLabel.get('Tạo Skill tự động')?.targetSelector, '#nc-03');
});

test('normalizeVietnamese handles NFD decomposed input and preserves regex metacharacters safely', () => {
  assert.equal(normalizeVietnamese('tie\u0302\u0301ng Vie\u0323\u0302t'), 'tieng viet');
  assert.equal(normalizeVietnamese('.*+?^${}()|[]\\'), '.*+?^${}()|[]\\');
});

test('buildSearchIndex handles null/empty options and missing item descriptions', () => {
  const emptyIndex = buildSearchIndex({
    cb07Templates: null,
    nc02Scenarios: null,
    nc04Templates: null,
  });
  // Still contains the 7 basic + 5 advanced static sections
  assert.equal(emptyIndex.length, 12);

  const customIndex = buildSearchIndex({
    cb07Templates: [{ id: 't1', title: 'Mẫu test', domainLabel: 'Khác', fields: {} }],
    nc02Scenarios: [{ id: 's1', title: 'Kịch bản test' }],
    nc04Templates: [{ id: 'a1', title: 'Mẫu NC test', domain: 'Gia đình', mode: 'workflow' }],
  });
  assert.equal(customIndex.length, 15);
});

test('searchItems handles non-array items, missing fields, regex chars, and tie-breaking', () => {
  assert.deepEqual(searchItems('ai', null), []);
  assert.deepEqual(searchItems('.*+?^${}()|[]\\', buildSearchIndex()), []);

  const items = [
    { id: 'first-tie', title: 'Mẫu Alpha', tabLabel: 'Cơ bản' },
    { id: 'second-tie', title: 'Mẫu Alpha', tabLabel: 'Cơ bản' },
    { id: 'exact', title: 'Alpha', tabLabel: 'Nâng cao' },
    { id: 'starts', title: 'Alpha Beta', tabLabel: 'Cơ bản' },
    { id: 'tab-only', title: 'Khác', tabLabel: 'Alpha' },
  ];

  const results = searchItems('alpha', items);
  assert.deepEqual(
    results.map((r) => r.id),
    ['exact', 'starts', 'first-tie', 'second-tie', 'tab-only']
  );

  // Multi-token AND: all tokens must match
  assert.deepEqual(searchItems('alpha khongtontai', items), []);
});
