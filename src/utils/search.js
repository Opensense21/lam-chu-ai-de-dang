import { CB07_TEMPLATES } from '../data/basic-guides.js';
import { NC04_TEMPLATES, NC02_SCENARIOS } from '../data/advanced-guides.js';

export function normalizeVietnamese(str) {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export const QUICK_START_GOALS = [
  {
    id: 'goal-write-email',
    label: 'Viết thư / Email',
    tab: 'basic',
    tabLabel: 'Cơ bản',
    sectionId: 'cb-07',
    targetSelector: '[data-template-id="tpl-msg-thanks"]',
    templateId: 'tpl-msg-thanks',
    description: 'Mẫu tin nhắn cảm ơn, hỏi thăm lịch sự dùng ngay.',
  },
  {
    id: 'goal-health',
    label: 'Hỏi sức khỏe',
    tab: 'basic',
    tabLabel: 'Cơ bản',
    sectionId: 'cb-07',
    targetSelector: '[data-template-id="tpl-health-terms"]',
    templateId: 'tpl-health-terms',
    description: 'Giải thích tên chỉ số khám sức khỏe bằng tiếng Việt dễ hiểu.',
  },
  {
    id: 'goal-summary',
    label: 'Tóm tắt tin',
    tab: 'basic',
    tabLabel: 'Cơ bản',
    sectionId: 'cb-07',
    targetSelector: '[data-template-id="tpl-sum-article"]',
    templateId: 'tpl-sum-article',
    description: 'Tóm tắt bài báo dài thành 5 ý ngắn gọn dễ đọc.',
  },
  {
    id: 'goal-prompt-builder',
    label: 'Ghép câu lệnh chuẩn',
    tab: 'basic',
    tabLabel: 'Cơ bản',
    sectionId: 'cb-04',
    targetSelector: '#cb-04',
    description: 'Trợ lý ghép câu lệnh 5 phần rõ ràng trước khi gửi AI.',
  },
  {
    id: 'goal-mcp-drive',
    label: 'Kết nối Drive / Lịch (MCP)',
    tab: 'advanced',
    tabLabel: 'Nâng cao',
    sectionId: 'nc-02',
    targetSelector: '#nc-02',
    scenarioId: 'drive-invoices',
    description: 'Mô phỏng Agent kết nối Google Drive qua MCP chỉ đọc an toàn.',
  },
  {
    id: 'goal-create-skill',
    label: 'Tạo Skill tự động',
    tab: 'advanced',
    tabLabel: 'Nâng cao',
    sectionId: 'nc-03',
    targetSelector: '#nc-03',
    description: 'Xưởng thiết kế SKILL.md và quy trình Agent nhiều bước.',
  },
];

export function buildSearchIndex(options = {}) {
  const {
    cb07Templates = CB07_TEMPLATES,
    nc02Scenarios = NC02_SCENARIOS,
    nc04Templates = NC04_TEMPLATES,
  } = options;

  const basicSections = [
    {
      id: 'section-cb-01',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-01',
      targetSelector: '#cb-01',
      title: 'AI là gì? Hiểu nhẹ nhàng qua ví dụ đời thường',
      description: 'Giới thiệu AI bằng ví von gần gũi và bài trắc nghiệm nhỏ AI làm được gì.',
      keywords: 'cb-01 gioi thieu ai la gi kha nang han che trac nghiem co ban',
    },
    {
      id: 'section-cb-02',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-02',
      targetSelector: '#cb-02',
      title: 'Quy tắc an toàn: Giữ kín thông tin cá nhân & Tránh lừa đảo',
      description: 'Những thông tin tuyệt đối không gửi cho AI (CCCD, mật khẩu, OTP, thẻ ngân hàng) và cách phòng tránh lừa đảo.',
      keywords: 'cb-02 bao mat an toan thong tin ca nhan cccd otp mat khau ngan hang lua dao',
    },
    {
      id: 'section-cb-03',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-03',
      targetSelector: '#cb-03',
      title: '4 nguyên tắc vàng để AI hiểu đúng ngay từ lần đầu',
      description: 'Cấu tạo 1 câu lệnh chuẩn gồm 4 mảnh ghép: Vai trò, Mục tiêu, Bối cảnh, Định dạng.',
      keywords: 'cb-03 4 nguyen tac vang cau tao prompt cau lenh vai tro muc tieu boi canh dinh dang',
    },
    {
      id: 'section-cb-04',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-04',
      targetSelector: '#cb-04',
      title: 'Trợ lý ghép câu lệnh chuẩn trước khi gửi AI',
      description: 'Công cụ ghép câu lệnh 5 phần kèm gợi ý bấm chọn nhanh, sao chép sang ChatGPT, Gemini, Claude.',
      keywords: 'cb-04 tro ly ghep cau lenh prompt builder tao cau hoi chuan chatgpt gemini claude',
    },
    {
      id: 'section-cb-05',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-05',
      targetSelector: '#cb-05',
      title: 'Kiểm tra độ rõ ràng trước khi gửi (Checklist & Điểm)',
      description: 'Thang điểm 0–100% và danh sách 5 bước kiểm tra câu lệnh trước khi bấm gửi AI.',
      keywords: 'cb-05 kiem tra chat luong do ro rang checklist diem san sang bao mat',
    },
    {
      id: 'section-cb-06',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-06',
      targetSelector: '#cb-06',
      title: 'So sánh Trước & Sau: Câu hỏi mơ hồ và Câu lệnh chuẩn',
      description: 'Xem trực tiếp sự khác biệt giữa cách hỏi ngắn gọn chung chung và câu lệnh đầy đủ 5 phần.',
      keywords: 'cb-06 so sanh truoc sau mo ho chuan vi du thuc te thuc don tin nhan tom tat du lich',
    },
    {
      id: 'section-cb-07',
      type: 'section',
      tab: 'basic',
      tabLabel: 'Cơ bản',
      sectionId: 'cb-07',
      targetSelector: '#cb-07',
      title: 'Kho mẫu câu lệnh dùng ngay trong đời sống',
      description: 'Các mẫu câu lệnh có sẵn theo 4 nhóm: Sức khỏe, Tin nhắn & Thư từ, Tóm tắt & Giải thích, Gia đình.',
      keywords: 'cb-07 kho mau cau lenh doi song suc khoe tin nhan email tom tat gia dinh',
    },
  ];

  const cb07Items = (Array.isArray(cb07Templates) ? cb07Templates : []).map((tpl) => ({
    id: `cb07-${tpl.id}`,
    type: 'template',
    tab: 'basic',
    tabLabel: 'Cơ bản',
    sectionId: 'cb-07',
    templateId: tpl.id,
    targetSelector: `[data-template-id="${tpl.id}"]`,
    title: tpl.title,
    description: tpl.description || '',
    keywords: [
      'cb-07 mau cau lenh co ban',
      tpl.domainLabel,
      tpl.fields?.role,
      tpl.fields?.context,
      tpl.fields?.task,
    ]
      .filter(Boolean)
      .join(' '),
  }));

  const advancedSections = [
    {
      id: 'section-nc-01',
      type: 'section',
      tab: 'advanced',
      tabLabel: 'Nâng cao',
      sectionId: 'nc-01',
      targetSelector: '#nc-01',
      title: 'Hiểu đúng về Agent, Skill, MCP và Plugin bằng ví dụ đời thường',
      description: 'Giải thích trực quan Agent, Skill, MCP, Plugin qua ví von căn bếp và bảng chọn giải pháp phù hợp.',
      keywords: 'nc-01 agent skill mcp plugin khai niem nang cao bang chon cau hinh json',
    },
    {
      id: 'section-nc-02',
      type: 'section',
      tab: 'advanced',
      tabLabel: 'Nâng cao',
      sectionId: 'nc-02',
      targetSelector: '#nc-02',
      title: 'Mô phỏng trực quan cách Agent, Skill, MCP và Plugin phối hợp',
      description: 'Xem từng bước Agent đọc Skill, xin phép kết nối MCP chỉ đọc và dùng Plugin thực thi công việc.',
      keywords: 'nc-02 mo phong simulator agent skill mcp plugin xin phep quyen doc',
    },
    {
      id: 'section-nc-03',
      type: 'section',
      tab: 'advanced',
      tabLabel: 'Nâng cao',
      sectionId: 'nc-03',
      targetSelector: '#nc-03',
      title: 'Xưởng thiết kế Skill (SKILL.md) & Quy trình Agent nhiều bước',
      description: 'Tạo file kỹ năng SKILL.md hoặc quy trình Agent nhiều bước có điểm dừng kiểm tra an toàn.',
      keywords: 'nc-03 xuong thiet ke tao skill.md workflow quy trinh nhieu buoc agent',
    },
    {
      id: 'section-nc-04',
      type: 'section',
      tab: 'advanced',
      tabLabel: 'Nâng cao',
      sectionId: 'nc-04',
      targetSelector: '#nc-04',
      title: 'Bộ mẫu thực tế dùng ngay (Skill & Quy trình nâng cao)',
      description: 'Các mẫu SKILL.md và quy trình Agent sẵn sàng sao chép hoặc chỉnh sửa trong Xưởng thiết kế.',
      keywords: 'nc-04 bo mau thuc te skill workflow json cli nang cao',
    },
    {
      id: 'section-nc-05',
      type: 'section',
      tab: 'advanced',
      tabLabel: 'Nâng cao',
      sectionId: 'nc-05',
      targetSelector: '#nc-05',
      title: 'Quyền hạn & An toàn khi dùng Agent nâng cao',
      description: 'Phân biệt quyền Chỉ đọc và Ghi/Xóa, nguyên tắc Con người duyệt trước và phòng tránh Prompt Injection.',
      keywords: 'nc-05 quyen han an toan read only human in the loop prompt injection',
    },
  ];

  const nc02Items = (Array.isArray(nc02Scenarios) ? nc02Scenarios : []).map((sc) => ({
    id: `nc02-${sc.id}`,
    type: 'scenario',
    tab: 'advanced',
    tabLabel: 'Nâng cao',
    sectionId: 'nc-02',
    scenarioId: sc.id,
    targetSelector: '#nc-02',
    title: sc.title,
    description: sc.summary || '',
    keywords: `nc-02 mo phong kich ban agent skill mcp plugin ${sc.id}`,
  }));

  const nc04Items = (Array.isArray(nc04Templates) ? nc04Templates : []).map((tpl) => ({
    id: `nc04-${tpl.id}`,
    type: 'template',
    tab: 'advanced',
    tabLabel: 'Nâng cao',
    sectionId: 'nc-04',
    templateId: tpl.id,
    targetSelector: `[data-template-id="${tpl.id}"]`,
    title: tpl.title,
    description: tpl.summary || '',
    keywords: [
      'nc-04 bo mau nang cao',
      tpl.domain,
      tpl.mode === 'skill' ? 'skill skill.md ky nang' : 'workflow quy trinh agent nhieu buoc',
    ]
      .filter(Boolean)
      .join(' '),
  }));

  return [
    ...basicSections,
    ...cb07Items,
    ...advancedSections,
    ...nc02Items,
    ...nc04Items,
  ];
}

export function searchItems(query, items = buildSearchIndex()) {
  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery || !Array.isArray(items)) return [];

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const normTitle = normalizeVietnamese(item.title || '');
    const normKeywords = normalizeVietnamese(item.keywords || '');
    const normDesc = normalizeVietnamese(item.description || '');
    const normTab = normalizeVietnamese(item.tabLabel || '');
    const combined = `${normTitle} ${normDesc} ${normKeywords} ${normTab}`;

    const allMatch = tokens.every((token) => combined.includes(token));
    if (!allMatch) continue;

    let score = 0;
    if (normTitle === normalizedQuery) {
      score += 100;
    } else if (normTitle.startsWith(normalizedQuery)) {
      score += 40;
    }

    if (tokens.every((token) => normTitle.includes(token))) {
      score += 30;
    }

    for (const token of tokens) {
      if (normTitle.includes(token)) score += 15;
      if (normKeywords.includes(token)) score += 8;
      if (normDesc.includes(token)) score += 4;
      if (normTab.includes(token)) score += 2;
    }

    scored.push({ item, score, index: i });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return scored.map((entry) => entry.item);
}
