export const COPY_SUCCESS_MESSAGE =
  'Đã sao chép! Bạn chỉ cần mở ChatGPT, Gemini hoặc Claude rồi bấm Dán (Ctrl+V hoặc chạm giữ → Dán).';

export const COPY_FAILURE_MESSAGE =
  'Không thể tự động sao chép. Bạn hãy bôi đen đoạn chữ và bấm Sao chép thủ công nhé.';

function announce(liveRegionEl, message) {
  if (!liveRegionEl) return;
  liveRegionEl.textContent = '';
  liveRegionEl.textContent = message;
}

function fallbackExecCommandCopy(text) {
  if (typeof document === 'undefined' || !document.body || typeof document.execCommand !== 'function') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);

  let copied = false;
  try {
    textarea.focus();
    textarea.select();
    copied = Boolean(document.execCommand('copy'));
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

export async function copyText(text, liveRegionEl) {
  if (typeof text !== 'string' || text.length === 0) {
    announce(liveRegionEl, COPY_FAILURE_MESSAGE);
    return false;
  }

  let copied = false;

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      copied = fallbackExecCommandCopy(text);
    }
  } else {
    copied = fallbackExecCommandCopy(text);
  }

  announce(liveRegionEl, copied ? COPY_SUCCESS_MESSAGE : COPY_FAILURE_MESSAGE);
  return copied;
}

export function renderPasteGuide(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="card paste-guide">
      <h2 id="paste-guide-title" class="card__title">Cách dán vào AI (3 bước đơn giản)</h2>
      <p class="card__intro">
        Ứng dụng này hoạt động hoàn toàn độc lập, không cần đăng nhập hay tài khoản. Sau khi bấm nút <strong>Sao chép</strong>, bạn làm theo 3 bước sau:
      </p>
      <ol class="paste-guide__steps">
        <li class="paste-guide__step">
          <div class="paste-guide__step-num" aria-hidden="true">1</div>
          <h3 class="paste-guide__step-title">Bấm nút Sao chép</h3>
          <p class="paste-guide__step-desc">
            Chọn câu lệnh mẫu hoặc tự ghép xong rồi bấm nút <strong>Sao chép</strong> ngay bên dưới.
          </p>
        </li>
        <li class="paste-guide__step">
          <div class="paste-guide__step-num" aria-hidden="true">2</div>
          <h3 class="paste-guide__step-title">Mở ứng dụng AI quen dùng</h3>
          <p class="paste-guide__step-desc">
            Mở ChatGPT, Gemini hoặc Claude trên điện thoại hoặc máy tính của bạn.
          </p>
        </li>
        <li class="paste-guide__step">
          <div class="paste-guide__step-num" aria-hidden="true">3</div>
          <h3 class="paste-guide__step-title">Dán vào ô nhắn tin và gửi</h3>
          <p class="paste-guide__step-desc">
            Chạm giữ vào ô nhập tin nhắn rồi chọn <strong>Dán</strong> (trên máy tính bấm <strong>Ctrl+V</strong>), sau đó bấm gửi.
          </p>
        </li>
      </ol>
    </div>
  `;
}
