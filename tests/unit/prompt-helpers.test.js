import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectSensitiveInfo,
  assembleBasicPrompt,
  evaluatePromptQuality,
} from '../../src/utils/prompt-helpers.js';
import { CB06_COMPARISONS, CB07_TEMPLATES } from '../../src/data/basic-guides.js';

test('detectSensitiveInfo returns [] for null, undefined, non-strings, and whitespace-only strings', () => {
  assert.deepEqual(detectSensitiveInfo(null), []);
  assert.deepEqual(detectSensitiveInfo(undefined), []);
  assert.deepEqual(detectSensitiveInfo(123456789012), []);
  assert.deepEqual(detectSensitiveInfo({ text: '0901234567' }), []);
  assert.deepEqual(detectSensitiveInfo(''), []);
  assert.deepEqual(detectSensitiveInfo('   \n\t  '), []);
});

test('detectSensitiveInfo detects 12-digit CCCD/CMND in contiguous, spaced, and dashed formats', () => {
  const contiguous = detectSensitiveInfo('Số giấy tờ của tôi là 079123456789.');
  assert.equal(contiguous.length, 1);
  assert.match(contiguous[0], /CCCD\/CMND/i);

  const spaced = detectSensitiveInfo('Mã số 079 123 456 789 cần kiểm tra');
  assert.equal(spaced.length, 1);
  assert.match(spaced[0], /CCCD\/CMND/i);

  const dashed = detectSensitiveInfo('Số 0791-2345-6789');
  assert.equal(dashed.length, 1);
  assert.match(dashed[0], /CCCD\/CMND/i);
});

test('detectSensitiveInfo does not produce false positives on dates or short numbers', () => {
  assert.deepEqual(detectSensitiveInfo('Ngày hẹn khám là 15/08/2025 lúc 8 giờ sáng.'), []);
  assert.deepEqual(detectSensitiveInfo('Hạn chót nộp hồ sơ: 15-08-2025.'), []);
  assert.deepEqual(detectSensitiveInfo('Tiền điện tháng này hết 250.000 đồng trong năm 2025.'), []);
});

test('detectSensitiveInfo detects Vietnamese phone numbers starting with 0 or +84', () => {
  const mobile0 = detectSensitiveInfo('Liên hệ tôi qua số 0901234567 nhé.');
  assert.equal(mobile0.length, 1);
  assert.match(mobile0[0], /điện thoại/i);

  const spaced0 = detectSensitiveInfo('Gọi số 090 123 4567 vào buổi sáng.');
  assert.equal(spaced0.length, 1);
  assert.match(spaced0[0], /điện thoại/i);

  const plus84 = detectSensitiveInfo('Số của tôi là +84901234567');
  assert.equal(plus84.length, 1);
  assert.match(plus84[0], /điện thoại/i);

  const plus84Spaced = detectSensitiveInfo('Liên hệ +84 901 234 567');
  assert.equal(plus84Spaced.length, 1);
  assert.match(plus84Spaced[0], /điện thoại/i);
});

test('detectSensitiveInfo detects 13-19 digit bank cards without double-triggering CCCD', () => {
  const contiguousCard = detectSensitiveInfo('Thẻ của tôi là 4111222233334444.');
  assert.equal(contiguousCard.length, 1);
  assert.match(contiguousCard[0], /ngân hàng/i);

  const groupedCard = detectSensitiveInfo('Số in trên mặt thẻ: 4111 2222 3333 4444.');
  assert.equal(groupedCard.length, 1);
  assert.match(groupedCard[0], /ngân hàng/i);

  const dashedCard = detectSensitiveInfo('Thẻ 4111-2222-3333-4444');
  assert.equal(dashedCard.length, 1);
  assert.match(dashedCard[0], /ngân hàng/i);
});

test('detectSensitiveInfo detects sensitive keywords regardless of case or Vietnamese diacritics', () => {
  const otp = detectSensitiveInfo('Tôi nhận được Mã OTP là 482910');
  assert.equal(otp.length, 1);
  assert.match(otp[0], /OTP/i);

  const pwAccented = detectSensitiveInfo('Đây là Mật Khẩu mới của tôi');
  assert.equal(pwAccented.length, 1);
  assert.match(pwAccented[0], /mật khẩu/i);

  const pwUnaccented = detectSensitiveInfo('Gui ban mat khau wifi va PASSCODE');
  assert.equal(pwUnaccented.length, 1);
  assert.match(pwUnaccented[0], /mật khẩu/i);

  const bankKw = detectSensitiveInfo('Chuyển vào STK hoặc so tai khoan ngan hang giúp tôi');
  assert.equal(bankKw.length, 1);
  assert.match(bankKw[0], /ngân hàng/i);

  const idKw = detectSensitiveInfo('Đây là ảnh chụp căn cước công dân và ho chieu');
  assert.equal(idKw.length, 1);
  assert.match(idKw[0], /CCCD\/CMND/i);
});

test('detectSensitiveInfo deduplicates warnings within the same category', () => {
  const warnings = detectSensitiveInfo(
    'CCCD của tôi là 079123456789, số CMND cũ không dùng nữa. Gọi 0901234567 hoặc 0912345678.'
  );
  assert.equal(warnings.length, 2);
});

test('detectSensitiveInfo returns multiple distinct warnings when multiple categories appear', () => {
  const warnings = detectSensitiveInfo(
    'CCCD 079123456789, thẻ 4111 2222 3333 4444, SĐT 0901234567, mã OTP 123456 và mật khẩu abc.'
  );
  assert.equal(warnings.length, 5);
});

test('detectSensitiveInfo returns [] for safe everyday Vietnamese prompts', () => {
  assert.deepEqual(
    detectSensitiveInfo(
      'Hãy đóng vai bác sĩ dinh dưỡng, gợi ý thực đơn 3 bữa nhẹ bụng cho người 65 tuổi bị tiểu đường.'
    ),
    []
  );
  assert.deepEqual(
    detectSensitiveInfo(
      'Viết giúp tôi lời chúc mừng sinh nhật ấm áp gửi cháu nội nhân ngày 15/08/2025, ngân sách quà khoảng 250.000 đồng.'
    ),
    []
  );
});

test('assembleBasicPrompt returns empty string for null, undefined, primitives, arrays, and empty/whitespace fields', () => {
  assert.equal(assembleBasicPrompt(null), '');
  assert.equal(assembleBasicPrompt(undefined), '');
  assert.equal(assembleBasicPrompt('role'), '');
  assert.equal(assembleBasicPrompt([]), '');
  assert.equal(assembleBasicPrompt({}), '');
  assert.equal(
    assembleBasicPrompt({
      role: '   ',
      context: '\n\t',
      task: '',
      format: ' ',
      constraints: '',
    }),
    ''
  );
});

test('assembleBasicPrompt assembles single and partial fields cleanly in canonical order', () => {
  assert.equal(
    assembleBasicPrompt({ task: '  Tóm tắt bài báo này  ' }),
    'Nhiệm vụ: Tóm tắt bài báo này.'
  );

  const partial = assembleBasicPrompt({
    role: 'Bác sĩ dinh dưỡng',
    task: 'Gợi ý thực đơn 3 bữa!',
    format: '5 gạch đầu dòng ngắn gọn',
  });
  assert.equal(
    partial,
    [
      'Hãy đóng vai Bác sĩ dinh dưỡng.',
      'Nhiệm vụ: Gợi ý thực đơn 3 bữa!',
      'Định dạng mong muốn: 5 gạch đầu dòng ngắn gọn.',
    ].join('\n')
  );
});

test('assembleBasicPrompt handles all 5 fields without duplicating "Hãy đóng vai" or punctuation', () => {
  const full = assembleBasicPrompt({
    role: 'Hãy đóng vai người hướng dẫn tận tình.',
    context: 'Cho người 65 tuổi mới dùng điện thoại',
    task: 'Giải thích cách nhận biết tin nhắn lừa đảo?',
    format: '4 gạch đầu dòng ngắn gọn…',
    constraints: 'Không dùng từ tiếng Anh',
  });

  assert.equal(
    full,
    [
      'Hãy đóng vai người hướng dẫn tận tình.',
      'Bối cảnh: Cho người 65 tuổi mới dùng điện thoại.',
      'Nhiệm vụ: Giải thích cách nhận biết tin nhắn lừa đảo?',
      'Định dạng mong muốn: 4 gạch đầu dòng ngắn gọn…',
      'Lưu ý thêm: Không dùng từ tiếng Anh.',
    ].join('\n')
  );
});

test('evaluatePromptQuality returns score 0 and 5 failed checks for empty or invalid inputs', () => {
  for (const input of [null, undefined, [], {}, { role: '   ', task: '' }]) {
    const result = evaluatePromptQuality(input);
    assert.equal(result.score, 0);
    assert.equal(result.checks.length, 5);
    assert.deepEqual(
      result.checks.map((c) => c.id),
      ['role', 'context', 'task', 'format', 'constraints']
    );
    assert.ok(result.checks.every((c) => c.passed === false && c.label.length > 0 && c.tip.length > 0));
    assert.deepEqual(result.privacyWarnings, []);
  }
});

test('evaluatePromptQuality scores 20, 40, 60, 80, 100 accurately as fields are populated', () => {
  assert.equal(evaluatePromptQuality({ role: 'Giáo viên' }).score, 20);
  assert.equal(evaluatePromptQuality({ role: 'Giáo viên', context: 'Lớp 1' }).score, 40);
  assert.equal(
    evaluatePromptQuality({ role: 'Giáo viên', context: 'Lớp 1', task: 'Giải thích' }).score,
    60
  );
  assert.equal(
    evaluatePromptQuality({
      role: 'Giáo viên',
      context: 'Lớp 1',
      task: 'Giải thích',
      format: '3 gạch đầu dòng',
    }).score,
    80
  );
  const full = evaluatePromptQuality({
    role: 'Giáo viên',
    context: 'Lớp 1',
    task: 'Giải thích',
    format: '3 gạch đầu dòng',
    constraints: 'Câu ngắn',
  });
  assert.equal(full.score, 100);
  assert.ok(full.checks.every((c) => c.passed === true));
  assert.deepEqual(full.privacyWarnings, []);
});

test('evaluatePromptQuality detects sensitive info across fields without false digit concatenation', () => {
  const safeBoundary = evaluatePromptQuality({
    role: 'Người dùng 123456',
    context: '789012 năm 2025',
  });
  assert.deepEqual(safeBoundary.privacyWarnings, []);

  const risky = evaluatePromptQuality({
    role: 'Chủ tài khoản',
    context: 'Số CCCD của tôi là 079123456789',
    task: 'Kiểm tra mã OTP 482910 và số 0901234567',
    format: 'Gửi vào mật khẩu abc',
    constraints: 'Số thẻ 4111 2222 3333 4444',
  });
  assert.equal(risky.score, 100);
  assert.equal(risky.privacyWarnings.length, 5);
});

test('evaluatePromptQuality scores 100 with zero privacyWarnings for every CB07_TEMPLATES item', () => {
  assert.ok(CB07_TEMPLATES.length > 0);
  for (const template of CB07_TEMPLATES) {
    const result = evaluatePromptQuality(template.fields);
    assert.equal(result.score, 100, `Expected score 100 for template "${template.id}"`);
    assert.deepEqual(
      result.privacyWarnings,
      [],
      `Expected no privacyWarnings for template "${template.id}"`
    );
  }
});

test('evaluatePromptQuality scores 100 with zero privacyWarnings for every CB06_COMPARISONS item', () => {
  assert.ok(CB06_COMPARISONS.length > 0);
  for (const comparison of CB06_COMPARISONS) {
    const result = evaluatePromptQuality(comparison.fields);
    assert.equal(result.score, 100, `Expected score 100 for comparison "${comparison.id}"`);
    assert.deepEqual(
      result.privacyWarnings,
      [],
      `Expected no privacyWarnings for comparison "${comparison.id}"`
    );
  }
});

test('detectSensitiveInfo detects 9-digit CMND numbers without keyword [BUG-03]', () => {
  const contiguous = detectSensitiveInfo('Số giấy tờ của tôi là 241567890');
  assert.equal(contiguous.length, 1);
  assert.match(contiguous[0], /CCCD\/CMND/i);

  const spaced = detectSensitiveInfo('Mã số 241 567 890');
  assert.equal(spaced.length, 1);
  assert.match(spaced[0], /CCCD\/CMND/i);

  const dashed = detectSensitiveInfo('Mã số 241-567-890');
  assert.equal(dashed.length, 1);
  assert.match(dashed[0], /CCCD\/CMND/i);
});

test('detectSensitiveInfo detects dot-separated card/CCCD, 3-6-3 CCCD, parenthesized/84 phone, and multiline/spaced keywords [BUG-04]', () => {
  assert.equal(detectSensitiveInfo('Thẻ 4111.2222.3333.4444').length, 1);
  const dotCccd = detectSensitiveInfo('Số 079.123.456.789');
  assert.equal(dotCccd.length, 1);
  assert.match(dotCccd[0], /CCCD\/CMND/i);

  const cccd363 = detectSensitiveInfo('Số 079 123456 789');
  assert.equal(cccd363.length, 1);
  assert.match(cccd363[0], /CCCD\/CMND/i);

  assert.equal(detectSensitiveInfo('Gọi số (090) 123-4567').length, 1);
  assert.equal(detectSensitiveInfo('Gọi số 84901234567').length, 1);
  assert.equal(detectSensitiveInfo('Đây là mật\nkhẩu của tôi').length, 1);
  assert.equal(detectSensitiveInfo('Gửi vào tài  khoản  ngân  hàng').length, 1);
  assert.equal(detectSensitiveInfo('Số thẻ của tôi là 1234').length, 1);
});

test('detectSensitiveInfo does not false-positive on Vietnamese "pin" (battery) while catching PIN phrases [BUG-05]', () => {
  assert.deepEqual(detectSensitiveInfo('Điện thoại của tôi sắp hết pin rồi'), []);
  assert.equal(detectSensitiveInfo('Nhập mã pin hoặc pin code để mở khóa').length, 1);
  assert.equal(detectSensitiveInfo('Vui lòng nhap pin ATM').length, 1);
});
