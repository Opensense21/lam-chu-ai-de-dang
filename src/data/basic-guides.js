import { assembleBasicPrompt } from '../utils/prompt-helpers.js';

export const CB01_INTRO = {
  id: 'cb-01',
  title: 'AI là gì? Hiểu nhẹ nhàng qua ví dụ đời thường',
  intro:
    'Bạn không cần biết lập trình hay rành máy tính mới dùng được AI. Hãy coi AI như một người trợ lý kiên nhẫn, luôn sẵn sàng nghe bạn dặn dò bằng tiếng Việt bình thường.',
  analogies: [
    {
      id: 'secretary',
      title: 'Như người thư ký cần mẫn',
      description:
        'AI đã đọc rất nhiều sách báo và tài liệu nên có thể giúp bạn tóm tắt bài dài, viết nháp thư từ hay giải thích tin tức trong vài giây.',
      example: 'Ví dụ: Nhờ AI tóm tắt một bài báo sức khỏe dài thành 5 gạch đầu dòng dễ đọc.',
    },
    {
      id: 'chef',
      title: 'Như đầu bếp nấu theo tờ dặn',
      description:
        'Bạn dặn đầu bếp càng rõ (món gì, ít mặn, không cay) thì món ăn càng vừa miệng. Với AI cũng vậy: nói rõ mong muốn ngay từ đầu sẽ cho kết quả sát ý.',
      example: 'Ví dụ: Dặn AI viết ngắn gọn, chữ đời thường cho người lớn tuổi đọc.',
    },
    {
      id: 'dictionary',
      title: 'Như cuốn từ điển biết trò chuyện',
      description:
        'Khác với sách giấy, bạn có thể hỏi lại AI bao nhiêu lần tùy thích nếu thấy chỗ nào còn khó hiểu mà không ngại làm phiền ai.',
      example: 'Ví dụ: Bảo AI "Giải thích lại câu trên đơn giản hơn nữa giúp tôi".',
    },
  ],
  capabilities: {
    canDoWell: [
      'Tóm tắt bài báo, tin nhắn hoặc tài liệu dài thành vài ý ngắn gọn.',
      'Viết nháp thư cảm ơn, tin nhắn thăm hỏi, lời chúc lịch sự và ấm áp.',
      'Giải thích các khái niệm mới (y tế, công nghệ, thủ tục) bằng ngôn ngữ đời thường.',
      'Gợi ý thực đơn ăn uống, danh sách đồ cần mang khi đi du lịch hoặc lịch sinh hoạt.',
    ],
    cannotOrMakesMistakes: [
      'Không thay thế bác sĩ khám bệnh hay luật sư tư vấn pháp lý chính thức.',
      'Đôi khi AI đoán nhầm số liệu, ngày tháng hoặc tên điều luật (gọi là Hallucination).',
      'Không tự biết hoàn cảnh riêng của bạn nếu bạn không kể ra trong câu hỏi.',
      'Không có cảm xúc thật và không thể tự chịu trách nhiệm thay cho quyết định của bạn.',
    ],
  },
  miniQuiz: [
    {
      id: 'q1',
      question: 'Nhờ AI tóm tắt một bài viết dài về cách chăm sóc cây cảnh thành 5 gạch đầu dòng dễ đọc.',
      canDo: true,
      explanation: 'Đúng rồi! Tóm tắt và sắp xếp thông tin ngắn gọn là điểm mạnh nhất của AI.',
      tip: 'Bạn có thể dặn thêm "dùng câu ngắn, không dùng từ tiếng Anh".',
    },
    {
      id: 'q2',
      question: 'Chụp hoặc gõ kết quả xét nghiệm có ghi họ tên thật để AI kê đơn thuốc uống thay bác sĩ.',
      canDo: false,
      explanation: 'Không nên! AI không thể khám bệnh hay kê đơn thuốc thay bác sĩ, và bạn cũng không nên đưa tên thật lên mạng.',
      tip: 'Chỉ nên nhờ AI giải thích ý nghĩa chung của tên chỉ số (không kèm tên thật), rồi hỏi lại bác sĩ điều trị.',
    },
    {
      id: 'q3',
      question: 'Nhờ AI viết nháp một tin nhắn chúc mừng sinh nhật ấm áp gửi cho cháu nội.',
      canDo: true,
      explanation: 'Chính xác! AI rất giỏi gợi ý câu chữ tình cảm, lịch sự để bạn chọn và sửa lại theo ý mình.',
      tip: 'Hãy kể thêm sở thích của cháu để lời chúc tự nhiên hơn.',
    },
    {
      id: 'q4',
      question: 'Dán số CCCD và mã OTP ngân hàng vào khung chat AI để nhờ kiểm tra giúp tài khoản.',
      canDo: false,
      explanation: 'Tuyệt đối không! Số CCCD, mật khẩu và mã OTP là thông tin bảo mật, không bao giờ gửi vào AI.',
      tip: 'Nếu nghi ngờ tin nhắn lừa đảo, hãy gọi thẳng tổng đài chính thức của ngân hàng hoặc hỏi người thân.',
    },
  ],
};

export const CB02_SAFETY = {
  id: 'cb-02',
  title: 'Quy tắc an toàn: Giữ kín thông tin cá nhân & Tránh lừa đảo',
  intro:
    'Dùng AI rất an toàn nếu bạn giữ thói quen không đưa thông tin nhạy cảm vào khung chat. Khi cần hỏi việc riêng tư, chỉ cần thay tên thật và con số thật bằng thông tin chung chung.',
  doNotShare: [
    {
      id: 'id-card',
      label: 'Số CCCD / CMND / Hộ chiếu',
      detail: 'Giấy tờ tùy thân gắn liền với danh tính và tài khoản ngân hàng của bạn.',
      safeAlternative: 'Cách hỏi an toàn: Thay bằng chữ [Số giấy tờ] hoặc chỉ ghi độ tuổi chung (ví dụ: "người 65 tuổi").',
    },
    {
      id: 'password',
      label: 'Mật khẩu, mã PIN, mã khóa ứng dụng',
      detail: 'Kể cả khi quên mật khẩu hay muốn nhờ AI kiểm tra độ mạnh, cũng không gõ mật khẩu thật vào.',
      safeAlternative: 'Cách hỏi an toàn: Chỉ hỏi "Hướng dẫn tôi từng bước đặt mật khẩu dễ nhớ mà an toàn".',
    },
    {
      id: 'otp',
      label: 'Mã OTP xác thực ngân hàng / ví điện tử',
      detail: 'Mã OTP chỉ dùng một lần để chuyển tiền hoặc đăng nhập, tuyệt đối không chia sẻ cho bất kỳ ai.',
      safeAlternative: 'Cách hỏi an toàn: Giữ kín mã OTP; nếu thấy tin nhắn lạ đòi OTP, hãy bỏ qua ngay.',
    },
    {
      id: 'bank-card',
      label: 'Số tài khoản, số thẻ ngân hàng, mã CVV mặt sau thẻ',
      detail: 'Để lộ số thẻ và 3 số CVV có thể khiến kẻ xấu lợi dụng rút tiền trái phép.',
      safeAlternative: 'Cách hỏi an toàn: Chỉ ghi số tiền minh họa (ví dụ: "10 triệu đồng") khi cần tính toán hoặc viết đơn.',
    },
    {
      id: 'medical-record',
      label: 'Hồ sơ bệnh án có tên thật, số điện thoại, địa chỉ nhà',
      detail: 'Thông tin sức khỏe và địa chỉ nhà là dữ liệu riêng tư cần được bảo vệ.',
      safeAlternative: 'Cách hỏi an toàn: Xóa tên, số điện thoại và địa chỉ trước khi hỏi AI giải thích thuật ngữ y khoa.',
    },
  ],
  antiScamRule: {
    title: 'Quy tắc 3 bước chống lừa đảo & kiểm chứng thông tin',
    steps: [
      {
        stepNumber: 1,
        title: 'Bình tĩnh dừng 10 giây trước tin nhắn gấp gáp',
        description:
          'Kẻ xấu có thể dùng AI để viết tin nhắn giả mạo ngân hàng, công an hoặc người thân rất trôi chảy. Thấy giục chuyển tiền hay dọa khóa tài khoản thì dừng lại ngay.',
      },
      {
        stepNumber: 2,
        title: 'Luôn kiểm tra chéo nguồn chính thống',
        description:
          'AI đôi khi đoán nhầm thông tin (Hallucination). Với chuyện tiền bạc, sức khỏe hay giấy tờ nhà nước, hãy gọi điện trực tiếp cho người thân, bác sĩ hoặc tổng đài chính thức để xác nhận.',
      },
      {
        stepNumber: 3,
        title: 'Nhớ quy tắc "3 Không" trước khi bấm gửi',
        description:
          'Không nhập mật khẩu/OTP — Không gửi số CCCD/thẻ ngân hàng — Không làm theo lời khuyên tài chính từ AI khi chưa kiểm chứng.',
      },
    ],
  },
};

const CB03_PRINCIPLES_LIST = [
  {
    id: 'p1-role',
    stepNumber: 1,
    title: 'Nói rõ AI cần đóng vai gì',
    description:
      'Khi bạn dặn AI đóng vai bác sĩ dinh dưỡng, giáo viên hay người hướng dẫn tận tình, AI sẽ chọn ngay giọng điệu nhẹ nhàng và kiến thức phù hợp.',
  },
  {
    id: 'p2-goal',
    stepNumber: 2,
    title: 'Nêu đúng việc bạn muốn làm',
    description:
      'Thay vì nói chung chung "giúp tôi viết thư", hãy nói rõ "viết thư cảm ơn dài khoảng 100 chữ". Càng rõ ràng, bạn càng đỡ phải sửa đi sửa lại.',
  },
  {
    id: 'p3-context',
    stepNumber: 3,
    title: 'Kể thêm hoàn cảnh thực tế (Bối cảnh)',
    description:
      'Cho AI biết bạn viết cho ai đọc (người lớn tuổi, cháu nhỏ, hàng xóm) và dùng vào dịp gì để câu chữ tự nhiên, đúng mực.',
  },
  {
    id: 'p4-format',
    stepNumber: 4,
    title: 'Dặn sẵn cách trình bày kết quả',
    description:
      'Bạn muốn đọc 5 gạch đầu dòng ngắn gọn, bảng so sánh hay đoạn văn chia mục? Dặn trước một lần là AI trình bày đúng ý ngay.',
  },
];

export const CB03_PRINCIPLES = {
  id: 'cb-03',
  title: '4 nguyên tắc vàng để AI hiểu đúng ngay từ lần đầu',
  intro:
    'Nhiều người mới dùng thường hỏi một câu quá ngắn nên phải hỏi đi hỏi lại 4–5 lần. Chỉ cần ghép đủ 4 mảnh ghép dưới đây vào một câu duy nhất, AI sẽ trả lời sát mong muốn ngay lập tức.',
  principles: CB03_PRINCIPLES_LIST,
  whyUpfrontCards: CB03_PRINCIPLES_LIST,
  anatomyDiagram: [
    {
      id: 'role',
      stepNumber: 1,
      label: '1. Vai trò',
      shortQuestion: 'AI đóng vai ai?',
      description: 'Giúp AI chọn đúng giọng văn, mức độ chuyên môn và sự tận tình phù hợp với bạn.',
      example: 'Hãy đóng vai người hướng dẫn công nghệ kiên nhẫn,',
      whyItHelps: 'Tránh việc AI trả lời bằng từ ngữ kỹ thuật khô khan, khó hiểu.',
    },
    {
      id: 'goal',
      stepNumber: 2,
      label: '2. Mục tiêu',
      shortQuestion: 'Bạn muốn AI làm việc gì?',
      description: 'Nêu rõ hành động cụ thể: tóm tắt, viết nháp, giải thích, hay lên danh sách.',
      example: 'giải thích giúp tôi cách nhận biết tin nhắn lừa đảo trên điện thoại',
      whyItHelps: 'AI đi thẳng vào trọng tâm, không trả lời lan man sang chuyện khác.',
    },
    {
      id: 'context',
      stepNumber: 3,
      label: '3. Bối cảnh',
      shortQuestion: 'Dùng cho ai, trong tình huống nào?',
      description: 'Kể ngắn gọn hoàn cảnh để AI chọn ví dụ gần gũi với đời sống của bạn.',
      example: 'cho người 65 tuổi mới dùng điện thoại thông minh,',
      whyItHelps: 'Ví dụ đưa ra sẽ sát với thực tế hằng ngày, dễ áp dụng ngay.',
    },
    {
      id: 'format',
      stepNumber: 4,
      label: '4. Định dạng kết quả',
      shortQuestion: 'Trình bày thế nào cho dễ đọc?',
      description: 'Quy định rõ độ dài, chia gạch đầu dòng hay dùng ngôn ngữ đời thường.',
      example: 'trình bày thành 4 gạch đầu dòng ngắn gọn, mỗi ý không quá 2 câu.',
      whyItHelps: 'Bạn đọc lướt một lần là hiểu ngay, không bị ngợp vì chữ quá dài.',
    },
  ],
};

export const BASIC_GUIDE_SECTIONS = [CB01_INTRO, CB02_SAFETY, CB03_PRINCIPLES];

export const CB04_BUILDER_SLOTS = [
  {
    id: 'role',
    label: '1. Vai trò (AI đóng vai ai?)',
    helperText: 'Chọn hoặc gõ vai trò để AI dùng đúng giọng điệu và kiến thức phù hợp với bạn.',
    placeholder: 'Ví dụ: Người hướng dẫn tận tình, Bác sĩ dinh dưỡng...',
    inputType: 'input',
    chips: [
      'Người hướng dẫn tận tình',
      'Bác sĩ dinh dưỡng',
      'Thư ký viết lách',
      'Người bạn trẻ rành công nghệ',
      'Giáo viên tiểu học kiên nhẫn',
    ],
  },
  {
    id: 'context',
    label: '2. Bối cảnh (Dùng cho ai, dịp nào?)',
    helperText: 'Kể ngắn gọn hoàn cảnh thực tế (không ghi tên thật, số CCCD hay số điện thoại).',
    placeholder: 'Ví dụ: Cho người lớn tuổi mới dùng điện thoại thông minh...',
    inputType: 'textarea',
    rows: 2,
    chips: [
      'Cho người lớn tuổi mới dùng điện thoại',
      'Gia đình có người ăn kiêng / tiểu đường',
      'Gửi người thân hoặc hàng xóm thân thiết',
      'Đọc nhanh trên điện thoại vào buổi sáng',
    ],
  },
  {
    id: 'task',
    label: '3. Nhiệm vụ (Muốn AI làm gì?)',
    helperText: 'Nêu rõ việc cụ thể bạn muốn AI làm: tóm tắt, viết nháp, giải thích hay lên danh sách.',
    placeholder: 'Ví dụ: Giải thích từng bước cách nhận biết tin nhắn lừa đảo...',
    inputType: 'textarea',
    rows: 3,
    chips: [
      'Tóm tắt các ý chính quan trọng nhất',
      'Viết nháp một tin nhắn lịch sự, ấm áp',
      'Giải thích dễ hiểu bằng ví dụ đời thường',
      'Lên danh sách việc cần chuẩn bị theo thứ tự',
    ],
  },
  {
    id: 'format',
    label: '4. Định dạng (Trình bày thế nào?)',
    helperText: 'Dặn trước cách trình bày để kết quả ngắn gọn, dễ đọc lướt trên màn hình.',
    placeholder: 'Ví dụ: 5 gạch đầu dòng ngắn gọn, mỗi ý tối đa 2 câu...',
    inputType: 'input',
    chips: [
      '5 gạch đầu dòng ngắn gọn',
      'Đoạn văn ngắn khoảng 100 chữ',
      'Bảng so sánh 2 cột dễ nhìn',
      'Chia từng bước 1, 2, 3 rõ ràng',
    ],
  },
  {
    id: 'constraints',
    label: '5. Ràng buộc (Lưu ý thêm để sát ý)',
    helperText: 'Nhắc AI tránh từ khó hiểu, không bịa số liệu hoặc giữ giọng văn nhẹ nhàng.',
    placeholder: 'Ví dụ: Không dùng từ tiếng Anh, câu ngắn gọn dễ đọc...',
    inputType: 'textarea',
    rows: 2,
    chips: [
      'Không dùng từ tiếng Anh hay thuật ngữ khó',
      'Câu ngắn gọn, chữ đời thường dễ đọc',
      'Không bịa số liệu, nhắc kiểm chứng nếu cần',
      'Giọng điệu nhẹ nhàng, tôn trọng, tích cực',
    ],
  },
];

const RAW_CB06_COMPARISONS = [
  {
    id: 'health-nutrition',
    topic: 'Sức khỏe & Dinh dưỡng',
    title: 'Gợi ý thực đơn cho người lớn tuổi bị tiểu đường nhẹ',
    vaguePrompt: 'Gợi ý thực đơn cho người tiểu đường.',
    vagueResponse:
      'Để kiểm soát đường huyết, bạn cần chú ý chỉ số glycemic index (GI) của từng loại carbohydrate phức hợp. Bữa sáng nên dùng yến mạch nguyên cám kết hợp hạt chia và sữa hạnh nhân không đường; bữa trưa cân đối tỷ lệ macro gồm ức gà áp chảo, quinoa và bông cải xanh hấp...',
    fields: {
      role: 'Bác sĩ dinh dưỡng tận tình',
      context: 'Nấu ăn tại nhà cho người 65 tuổi bị tiểu đường nhẹ, thích món Việt quen thuộc',
      task: 'Gợi ý thực đơn 1 ngày (sáng, trưa, tối) dễ nấu và tiết kiệm',
      format: 'Chia 3 bữa rõ ràng, mỗi bữa tối đa 2 dòng',
      constraints: 'Chỉ dùng nguyên liệu dễ mua ở chợ Việt Nam, không dùng thuật ngữ y khoa khó hiểu',
    },
    optimizedResponse:
      '• Bữa sáng: 1 tô cháo yến mạch nấu thịt bằm (hoặc 1 củ khoai lang luộc vừa) kèm 1 ly sữa đậu nành không đường.\n• Bữa trưa: 1 lưng chén cơm gạo lứt (hoặc cơm trắng ít lại), cá diêu hồng kho nhạt, canh rau cải nấu gừng.\n• Bữa tối: Bún gạo lứt nấu tôm tươi và rau cải ngọt, tráng miệng bằng nửa quả ổi hoặc vài múi bưởi.',
    whyBetter:
      'Nhờ có bối cảnh người 65 tuổi thích món Việt và ràng buộc không dùng từ tiếng Anh, AI đổi từ "quinoa, glycemic index" sang món chợ Việt quen thuộc, chia 3 bữa ngắn gọn dễ đọc ngay.',
  },
  {
    id: 'messages-email',
    topic: 'Soạn tin nhắn / Email',
    title: 'Từ chối khéo buổi họp lớp cuối tuần',
    vaguePrompt: 'Viết tin nhắn từ chối đi họp lớp.',
    vagueResponse:
      'Kính gửi tập thể lớp, tôi xin chân thành cảm ơn lời mời tham dự buổi họp mặt sắp tới. Tuy nhiên, do một số công việc cá nhân đột xuất không thể thu xếp được, tôi xin phép vắng mặt trong sự kiện lần này. Trân trọng cảm ơn.',
    fields: {
      role: 'Người bạn khéo léo, chân thành',
      context: 'Nhắn tin Zalo cho bạn cũ cùng lớp vì cuối tuần bận trông cháu nên không dự họp lớp được',
      task: 'Viết nháp 2 mẫu tin nhắn từ chối khéo và hẹn dịp sau',
      format: 'Mỗi mẫu dài khoảng 3–4 câu ngắn, dễ chọn',
      constraints: 'Giọng thân mật, ấm áp, không sáo rỗng',
    },
    optimizedResponse:
      'Mẫu 1 (Thân tình): "Cả nhà ơi, cuối tuần này mình kẹt lịch trông cháu giúp con nên đành lỗi hẹn buổi họp lớp rồi. Tiếc quá đi mất! Chúc lớp mình gặp mặt thật vui và nhớ chụp nhiều ảnh gửi lên nhóm nhé, hẹn dịp tới mình nhất định có mặt."\n\nMẫu 2 (Ngắn gọn): "Chào các bạn, tuần này nhà mình có việc bận trông cháu nhỏ nên không tham gia họp lớp được. Mong cả nhà thông cảm nhé, chúc mọi người có một buổi hội ngộ thật rôm rả!"',
    whyBetter:
      'Thay vì văn phong hành chính cứng nhắc ("Kính gửi", "Trân trọng"), AI viết đúng giọng bạn bè thân thiết trên Zalo và đưa sẵn 2 mẫu để bạn chọn ngay.',
  },
  {
    id: 'news-summary',
    topic: 'Tóm tắt tin tức / tài liệu',
    title: 'Tóm tắt thông báo quy định mới cho người dân',
    vaguePrompt: 'Tóm tắt bài này giúp tôi.',
    vagueResponse:
      'Căn cứ theo Thông tư số 45/2025/TT-BTC và Nghị định sửa đổi bổ sung một số điều của Luật hiện hành, cơ quan chức năng ban hành các quy định liên quan đến thủ tục hành chính công trực tuyến cấp độ 4, lộ trình chuyển đổi dữ liệu định danh điện tử và các điều khoản thi hành đối với tổ chức, cá nhân...',
    fields: {
      role: 'Người thư ký đọc báo tóm tắt nhanh',
      context: 'Tôi đọc bài thông báo quy định mới trên điện thoại và muốn nắm phần ảnh hưởng đến gia đình',
      task: 'Tóm tắt những điểm người dân cần biết và việc cần làm',
      format: '4 gạch đầu dòng ngắn gọn, mỗi ý không quá 20 chữ',
      constraints: 'Bỏ qua số hiệu văn bản rườm rà, chỉ giữ ý thực tế và ngày áp dụng',
    },
    optimizedResponse:
      '• Quy định mới bắt đầu áp dụng từ ngày 01/07 năm nay trên toàn quốc.\n• Người dân có thể làm thủ tục gia hạn giấy tờ ngay trên điện thoại hoặc tại phường.\n• Người cao tuổi vẫn được hỗ trợ làm trực tiếp tại quầy như trước, không bắt buộc tự làm.\n• Cần mang theo CCCD gắn chip bản chính khi đi đối chiếu thông tin lần đầu.',
    whyBetter:
      'Nhờ dặn rõ "bỏ số hiệu văn bản rườm rà" và "mỗi ý không quá 20 chữ", AI lọc ngay phần thực tế ảnh hưởng đến gia đình để bạn đọc lướt trong 10 giây.',
  },
  {
    id: 'family-plan',
    topic: 'Kế hoạch gia đình',
    title: 'Lịch trình đi Đà Lạt 3 ngày cho cả ông bà và cháu nhỏ',
    vaguePrompt: 'Lập kế hoạch đi Đà Lạt cho gia đình.',
    vagueResponse:
      'Ngày 1: 5h sáng săn mây Cầu Đất, 9h trekking thác Datanla, 14h chèo SUP hồ Tuyền Lâm, 19h dạo chợ đêm. Ngày 2: Leo đỉnh Langbiang, chạy xe máy khám phá Tà Nung, tối đi cà phê acoustic đến khuya...',
    fields: {
      role: 'Người lên lịch du lịch gia đình chu đáo',
      context: 'Gia đình 6 người gồm ông bà 70 tuổi và 2 cháu nhỏ đi Đà Lạt 3 ngày 2 đêm',
      task: 'Gợi ý lịch trình nhẹ nhàng, ít đi bộ dốc và danh sách đồ cần mang',
      format: 'Chia theo từng ngày (Sáng / Chiều / Tối) kèm mục đồ cần mang ở cuối',
      constraints: 'Ưu tiên nơi nghỉ ngơi thoải mái, không xếp lịch dày đặc',
    },
    optimizedResponse:
      '• Ngày 1 — Sáng: Nhận phòng, nghỉ ngơi uống trà ấm. Chiều: Dạo vườn hoa thành phố (đường bằng phẳng). Tối: Ăn lẩu gà lá é gần khách sạn, ngủ sớm.\n• Ngày 2 — Sáng: Thăm Thiền viện Trúc Lâm (đi cáp treo đỡ leo dốc). Chiều: Nghỉ trưa, chiều muộn ra Hồ Xuân Hương hóng mát. Tối: Ăn cơm gia đình ấm cúng.\n• Ngày 3 — Sáng: Mua đặc sản, dạo chợ nhẹ nhàng rồi ra xe về.\n• Đồ cần mang: Áo khoác ấm cho ông bà và bé, thuốc say xe, giày đế mềm chống trơn.',
    whyBetter:
      'Khi biết có ông bà 70 tuổi và cháu nhỏ, AI bỏ ngay các hoạt động leo núi, đi bộ dốc và bổ sung lưu ý áo ấm, thuốc men rất chu đáo.',
  },
];

export const CB06_COMPARISONS = RAW_CB06_COMPARISONS.map((item) => ({
  ...item,
  optimizedPrompt: assembleBasicPrompt(item.fields),
}));

export const CB07_TEMPLATES = [
  {
    id: 'tpl-health-meal',
    domain: 'health',
    domainLabel: 'Sức khỏe & Dinh dưỡng',
    title: 'Gợi ý thực đơn nhẹ bụng hằng ngày',
    description: 'Nhờ AI lên thực đơn 3 bữa món Việt dễ nấu, phù hợp người lớn tuổi hoặc người ăn kiêng.',
    fields: {
      role: 'Bác sĩ dinh dưỡng tận tình',
      context: 'Nấu ăn tại nhà cho người 65 tuổi, cần món mềm, dễ tiêu hóa và ít dầu mỡ',
      task: 'Gợi ý thực đơn 3 bữa (sáng, trưa, tối) trong 1 ngày',
      format: 'Chia 3 mục rõ ràng, mỗi bữa tối đa 2 dòng ngắn',
      constraints: 'Chỉ dùng nguyên liệu quen thuộc ở chợ Việt Nam, không dùng từ tiếng Anh',
    },
  },
  {
    id: 'tpl-health-terms',
    domain: 'health',
    domainLabel: 'Sức khỏe & Dinh dưỡng',
    title: 'Giải thích tên chỉ số khám sức khỏe (không đưa tên thật)',
    description: 'Hiểu ý nghĩa chung của tên chỉ số xét nghiệm bằng tiếng Việt đời thường trước khi hỏi bác sĩ.',
    fields: {
      role: 'Bác sĩ giải thích dễ hiểu cho người không rành y khoa',
      context: 'Tôi vừa nhận tờ kết quả khám sức khỏe định kỳ (không nêu tên thật hay số giấy tờ)',
      task: 'Giải thích ý nghĩa chung của chỉ số Cholesterol và Đường huyết lúc đói',
      format: 'Trình bày 2 phần ngắn gọn, kèm 2 câu hỏi gợi ý để tôi hỏi lại bác sĩ khám bệnh',
      constraints: 'Không tự ý kê đơn thuốc, nhắc tôi kiểm chứng với bác sĩ điều trị',
    },
  },
  {
    id: 'tpl-msg-birthday',
    domain: 'messages',
    domainLabel: 'Tin nhắn & Thư từ',
    title: 'Lời chúc sinh nhật / lễ Tết ấm áp gửi người thân',
    description: 'Viết lời chúc tự nhiên, tình cảm để gửi qua Zalo hoặc thiệp mừng cho con cháu, bạn bè.',
    fields: {
      role: 'Người thân tình cảm, khéo léo trong câu chữ',
      context: 'Viết tin nhắn Zalo chúc mừng sinh nhật cháu gái 10 tuổi thích vẽ tranh',
      task: 'Viết nháp 2 mẫu lời chúc ngắn gọn, vui tươi và ấm áp',
      format: 'Mỗi mẫu khoảng 3 câu ngắn, dễ đọc trên điện thoại',
      constraints: 'Giọng tự nhiên như người nhà trò chuyện, không sáo rỗng',
    },
  },
  {
    id: 'tpl-msg-thanks',
    domain: 'messages',
    domainLabel: 'Tin nhắn & Thư từ',
    title: 'Tin nhắn cảm ơn hoặc hỏi thăm lịch sự',
    description: 'Soạn nhanh tin nhắn cảm ơn hàng xóm, thầy cô hoặc đồng nghiệp cũ mà không mất thời gian nghĩ câu chữ.',
    fields: {
      role: 'Thư ký viết lách lịch sự, chân thành',
      context: 'Muốn nhắn tin cảm ơn bác hàng xóm đã trông giúp nhà cửa khi gia đình đi vắng 3 ngày',
      task: 'Viết 1 tin nhắn cảm ơn ấm áp và ngỏ ý gửi tặng chút quà quê',
      format: 'Đoạn văn ngắn 3–4 câu',
      constraints: 'Giọng điệu lễ phép, gần gũi, đúng mực tình làng nghĩa xóm',
    },
  },
  {
    id: 'tpl-sum-article',
    domain: 'summary',
    domainLabel: 'Tóm tắt & Giải thích',
    title: 'Tóm tắt bài báo dài thành 5 ý dễ đọc',
    description: 'Rút gọn tin tức dài dòng thành vài gạch đầu dòng trọng tâm để đọc nhanh không mỏi mắt.',
    fields: {
      role: 'Người thư ký đọc báo tóm tắt nhanh',
      context: 'Tôi đọc tin tức trên điện thoại và hay bị rối khi bài báo viết quá dài',
      task: 'Tóm tắt nội dung bài viết tôi sắp dán bên dưới thành các ý chính quan trọng nhất',
      format: '5 gạch đầu dòng ngắn gọn, mỗi ý không quá 20 chữ',
      constraints: 'Dùng tiếng Việt đời thường, giữ nguyên số liệu quan trọng và không suy đoán thêm',
    },
  },
  {
    id: 'tpl-sum-scam',
    domain: 'summary',
    domainLabel: 'Tóm tắt & Giải thích',
    title: 'Kiểm tra dấu hiệu tin nhắn lạ nghi lừa đảo',
    description: 'Nhờ AI phân tích dấu hiệu đáng ngờ của một tin nhắn lạ (nhớ xóa tên, số điện thoại thật trước khi dán).',
    fields: {
      role: 'Chuyên gia hướng dẫn an toàn mạng cho người lớn tuổi',
      context: 'Tôi nhận được một tin nhắn lạ giục bấm vào đường link nhận quà (đã xóa thông tin cá nhân của tôi)',
      task: 'Chỉ ra những dấu hiệu đáng ngờ của tin nhắn này và khuyên tôi nên làm gì tiếp theo',
      format: 'Chia 2 phần: Dấu hiệu đáng ngờ (3 ý) và Cách xử lý an toàn (3 bước)',
      constraints: 'Không dùng thuật ngữ kỹ thuật, nhắc tôi tuyệt đối không bấm link hay gửi mã xác thực ngân hàng',
    },
  },
  {
    id: 'tpl-fam-trip',
    domain: 'family',
    domainLabel: 'Gia đình & Đời sống',
    title: 'Lịch trình đi chơi nhẹ nhàng cho cả nhà',
    description: 'Lên kế hoạch tham quan, nghỉ ngơi vừa sức cho gia đình có cả người lớn tuổi và trẻ nhỏ.',
    fields: {
      role: 'Người lên lịch du lịch gia đình chu đáo',
      context: 'Gia đình nhiều thế hệ (có ông bà lớn tuổi và cháu nhỏ) đi chơi cuối tuần 2 ngày 1 đêm',
      task: 'Gợi ý lịch trình tham quan nhẹ nhàng, ít đi bộ và danh sách đồ dùng cần mang',
      format: 'Chia theo Sáng / Chiều / Tối từng ngày kèm danh sách đồ mang theo',
      constraints: 'Ưu tiên chỗ nghỉ ngơi thoải mái, không xếp lịch di chuyển quá dày',
    },
  },
  {
    id: 'tpl-fam-budget',
    domain: 'family',
    domainLabel: 'Gia đình & Đời sống',
    title: 'Bảng dự trù chi tiêu & đồ cần mua cho dịp giỗ/Tết',
    description: 'Sắp xếp danh sách đi chợ, nấu nướng và dự trù chi phí gọn gàng để không bị sót việc.',
    fields: {
      role: 'Người nội trợ đảm đang, chu toàn việc gia đình',
      context: 'Chuẩn bị làm 3 mâm cơm gia đình dịp cuối tuần với ngân sách khoảng 3 triệu đồng',
      task: 'Lập danh sách thực phẩm cần mua theo nhóm và gợi ý thực đơn 3 mâm cơm ấm cúng',
      format: 'Bảng hoặc danh sách chia 3 nhóm: Đồ tươi sống, Rau củ gia vị, Tráng miệng & Nước uống',
      constraints: 'Món ăn quen thuộc dễ nấu tại nhà, ước lượng chi phí hợp lý để không bị lãng phí',
    },
  },
];
