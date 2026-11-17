function normalizeForKeywordMatch(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function countDigits(str) {
  return str.replace(/\D/g, '').length;
}

const WARNING_MESSAGES = {
  id: 'Phát hiện thông tin nghi là số CCCD/CMND hoặc giấy tờ tùy thân. Hãy xóa hoặc thay bằng chữ [Số giấy tờ] trước khi gửi cho AI.',
  bank: 'Phát hiện thông tin nghi là số thẻ hoặc tài khoản ngân hàng. Không nên chia sẻ thông tin tài chính với AI.',
  phone: 'Phát hiện số điện thoại cá nhân. Hãy ẩn hoặc thay bằng số minh họa để giữ riêng tư.',
  otp: 'Phát hiện từ khóa liên quan đến mã OTP, mã PIN hoặc CVV. Tuyệt đối không gửi các mã bảo mật này cho AI.',
  password: 'Phát hiện từ khóa liên quan đến mật khẩu. Không bao giờ nhập mật khẩu thật vào AI.',
};

const BANK_CARD_CANDIDATE_RE = /(?<!\d)(?:\d{13,19}|\d{4}(?:[ .-]\d{4}){2,3}(?:[ .-]\d{1,4})?)(?!\d)/g;
const CCCD_12_CANDIDATE_RE =
  /(?<!\d)(?:\d{12}|\d{3}(?:[ .-]\d{3}){3}|\d{4}(?:[ .-]\d{4}){2}|\d{3}[ .-]\d{6}[ .-]\d{3})(?!\d)/g;
const CMND_9_CANDIDATE_RE = /(?<!\d)(?:\d{9}|\d{3}(?:[ .-]\d{3}){2})(?!\d)/g;
const PHONE_CANDIDATE_RE = /(?<!\d)(?:\+?84|\(0\d{1,3}\)|0)(?:[ .()-]?\d){7,10}(?!\d)/g;

const KEYWORD_OTP_RE =
  /\b(?:otp|ma otp|ma pin|pin code|nhap pin|so pin|doi pin|quen pin|pin atm|pin the|pin ngan hang|cvv|cvc)\b|\bpin\s*[:=]/;
const KEYWORD_PASSWORD_RE = /\b(?:mat khau|password|passcode)\b/;
const KEYWORD_BANK_RE = /\b(?:so tai khoan|tai khoan ngan hang|stk|so the ngan hang|so the atm|so the)\b/;
const KEYWORD_ID_RE = /\b(?:cccd|cmnd|can cuoc cong dan|chung minh nhan dan|ho chieu)\b/;

/**
 * Inspects user-entered text for sensitive personal or financial information.
 * Returns an array of distinct Vietnamese warning messages (one per category).
 */
export function detectSensitiveInfo(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  const foundCategories = new Set();
  let remainingText = text;

  // 1. Detect 13-19 digit bank card / account sequences first and mask them
  // so they do not double-trigger CCCD or phone number checks.
  remainingText = remainingText.replace(BANK_CARD_CANDIDATE_RE, (match) => {
    const digits = countDigits(match);
    if (digits >= 13 && digits <= 19) {
      foundCategories.add('bank');
      return ' '.repeat(match.length);
    }
    return match;
  });

  // 2. Detect 12-digit CCCD numbers (contiguous, 3-3-3-3, 4-4-4, or 3-6-3) and mask them.
  remainingText = remainingText.replace(CCCD_12_CANDIDATE_RE, (match) => {
    if (countDigits(match) === 12) {
      foundCategories.add('id');
      return ' '.repeat(match.length);
    }
    return match;
  });

  // 3. Detect Vietnamese phone numbers (0..., (0...), +84..., 84..., 9-11 digits total) and mask them.
  remainingText = remainingText.replace(PHONE_CANDIDATE_RE, (match) => {
    const digits = countDigits(match);
    if (digits >= 9 && digits <= 11) {
      foundCategories.add('phone');
      return ' '.repeat(match.length);
    }
    return match;
  });

  // 4. Detect 9-digit CMND numbers (contiguous or 3-3-3) and mask them.
  remainingText = remainingText.replace(CMND_9_CANDIDATE_RE, (match) => {
    if (countDigits(match) === 9) {
      foundCategories.add('id');
      return ' '.repeat(match.length);
    }
    return match;
  });

  // 4. Detect sensitive Vietnamese/English keywords (case- and diacritic-insensitive).
  const normalized = normalizeForKeywordMatch(text);

  if (KEYWORD_ID_RE.test(normalized)) {
    foundCategories.add('id');
  }
  if (KEYWORD_BANK_RE.test(normalized)) {
    foundCategories.add('bank');
  }
  if (KEYWORD_OTP_RE.test(normalized)) {
    foundCategories.add('otp');
  }
  if (KEYWORD_PASSWORD_RE.test(normalized)) {
    foundCategories.add('password');
  }

  const orderedCategories = ['id', 'bank', 'phone', 'otp', 'password'];
  const warnings = [];
  for (const category of orderedCategories) {
    if (foundCategories.has(category)) {
      warnings.push(WARNING_MESSAGES[category]);
    }
  }

  return warnings;
}

function cleanField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function ensureSentenceEnd(text) {
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

const PROMPT_FIELD_KEYS = ['role', 'context', 'task', 'format', 'constraints'];

function normalizePromptFields(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return {
      role: '',
      context: '',
      task: '',
      format: '',
      constraints: '',
    };
  }

  return {
    role: cleanField(fields.role),
    context: cleanField(fields.context),
    task: cleanField(fields.task),
    format: cleanField(fields.format),
    constraints: cleanField(fields.constraints),
  };
}

const QUALITY_CHECK_SPECS = [
  {
    id: 'role',
    label: 'Đã chọn vai trò cho AI',
    tip: 'Nếu thiếu vai trò, AI dễ trả lời bằng giọng điệu chung chung hoặc dùng từ ngữ kỹ thuật khó hiểu.',
  },
  {
    id: 'context',
    label: 'Đã nêu rõ bối cảnh / hoàn cảnh',
    tip: 'Nếu thiếu bối cảnh, AI không biết bạn hỏi cho ai (người lớn tuổi, cháu nhỏ...) nên ví dụ đưa ra dễ bị lệch.',
  },
  {
    id: 'task',
    label: 'Đã ghi rõ nhiệm vụ cần AI làm',
    tip: 'Nếu thiếu nhiệm vụ cụ thể, AI sẽ không biết bạn muốn tóm tắt, viết nháp hay giải thích, dẫn đến trả lời lan man.',
  },
  {
    id: 'format',
    label: 'Đã dặn cách trình bày (định dạng)',
    tip: 'Nếu thiếu định dạng, AI thường viết thành đoạn văn rất dài và nhiều chữ, khó đọc lướt trên điện thoại.',
  },
  {
    id: 'constraints',
    label: 'Đã có lưu ý / ràng buộc khi trả lời',
    tip: 'Nếu thiếu ràng buộc, AI có thể dùng từ tiếng Anh hoặc câu quá dài; dặn trước giúp nhận kết quả sát ý ngay lần đầu.',
  },
];

/**
 * Assembles a natural Vietnamese prompt from the 5 guided builder slots.
 */
export function assembleBasicPrompt(fields) {
  const cleaned = normalizePromptFields(fields);
  const hasAny = PROMPT_FIELD_KEYS.some((key) => cleaned[key].length > 0);
  if (!hasAny) {
    return '';
  }

  const lines = [];

  if (cleaned.role) {
    if (/^(?:hãy\s+)?đóng\s+vai\b/i.test(cleaned.role)) {
      lines.push(ensureSentenceEnd(cleaned.role));
    } else {
      lines.push(ensureSentenceEnd(`Hãy đóng vai ${cleaned.role}`));
    }
  }

  if (cleaned.context) {
    lines.push(ensureSentenceEnd(`Bối cảnh: ${cleaned.context}`));
  }

  if (cleaned.task) {
    lines.push(ensureSentenceEnd(`Nhiệm vụ: ${cleaned.task}`));
  }

  if (cleaned.format) {
    lines.push(ensureSentenceEnd(`Định dạng mong muốn: ${cleaned.format}`));
  }

  if (cleaned.constraints) {
    lines.push(ensureSentenceEnd(`Lưu ý thêm: ${cleaned.constraints}`));
  }

  return lines.join('\n');
}

/**
 * Evaluates prompt completeness (0-100) across 5 quality checks and runs Privacy Guard.
 */
export function evaluatePromptQuality(fields) {
  const cleaned = normalizePromptFields(fields);

  const checks = QUALITY_CHECK_SPECS.map((spec) => ({
    id: spec.id,
    label: spec.label,
    passed: cleaned[spec.id].length > 0,
    tip: spec.tip,
  }));

  const passedCount = checks.filter((item) => item.passed).length;
  const score = passedCount * 20;

  const combinedText = PROMPT_FIELD_KEYS.map((key) => cleaned[key])
    .filter(Boolean)
    .join('\n');

  const privacyWarnings = detectSensitiveInfo(combinedText);

  return {
    score,
    checks,
    privacyWarnings,
  };
}
