export const NC01_CONCEPTS = {
  title: 'NC-01: Hiểu đúng về Agent, Skill, MCP và Plugin bằng ví dụ đời thường',
  intro:
    'Bạn không cần biết lập trình để hiểu công nghệ AI nâng cao. Hãy hình dung AI giống như một căn bếp thông minh: mỗi khái niệm là một vai trò quen thuộc.',
  analogies: [
    {
      id: 'ai',
      title: 'AI (Trí tuệ nhân tạo)',
      metaphor: 'Đầu bếp giỏi',
      plainDesc:
        'Biết lắng nghe yêu cầu, suy nghĩ, viết lách và tổng hợp thông tin. Tuy nhiên, đầu bếp chỉ làm việc tốt khi có công thức rõ ràng và nguyên liệu sạch.',
      glossaryTerm: 'ai',
    },
    {
      id: 'skill',
      title: 'Agent Skill (Kỹ năng mẫu)',
      metaphor: 'Sổ tay quy trình chuẩn',
      plainDesc:
        'Tờ hướng dẫn từng bước viết sẵn (ví dụ file SKILL.md) để AI làm đúng một kiểu từ đầu đến cuối mà bạn không phải nhắc lại mỗi ngày.',
      glossaryTerm: 'skill',
    },
    {
      id: 'mcp',
      title: 'MCP (Cổng kết nối chuẩn)',
      metaphor: 'Ổ cắm tiêu chuẩn kết nối dữ liệu',
      plainDesc:
        'Cầu nối an toàn giúp AI đọc đúng thư mục, lịch hẹn hoặc ghi chú của bạn theo quyền bạn cho phép (chỉ đọc hoặc hỏi trước khi sửa).',
      glossaryTerm: 'mcp',
    },
    {
      id: 'plugin',
      title: 'Plugin (Tiện ích mở rộng)',
      metaphor: 'Dụng cụ hành động',
      plainDesc:
        'Các công cụ gắn thêm để AI thực hiện việc cụ thể như đọc bảng PDF phức tạp, tạo file văn bản hoặc xuất bảng tính.',
      glossaryTerm: 'plugin',
    },
  ],
  decisionTable: [
    {
      situation: 'Hỏi đáp nhanh, viết một lá thư hoặc tóm tắt đoạn văn',
      choice: 'Chỉ cần Prompt thông thường',
      reason: 'Việc đơn lẻ, làm xong trong một lượt hỏi không cần quy trình phức tạp.',
      example: 'Tóm tắt bài báo sức khỏe thành 5 ý chính.',
    },
    {
      situation: 'Việc lặp đi lặp lại mỗi tuần theo đúng một mẫu cố định',
      choice: 'Dùng Agent Skill (SKILL.md)',
      reason: 'Lưu sẵn quy trình chuẩn để AI luôn trình bày đúng bố cục bạn muốn.',
      example: 'Tóm tắt biên bản họp nhóm luôn gồm 3 mục: Quyết định, Người làm, Hạn chót.',
    },
    {
      situation: 'Cần AI xem dữ liệu trong Google Drive, Lịch hoặc Ghi chú cá nhân',
      choice: 'Kết nối qua MCP (ưu tiên chỉ đọc)',
      reason: 'MCP giúp AI đọc dữ liệu bên ngoài một cách kiểm soát được và có bước xin phép.',
      example: 'Tìm các hóa đơn tiền điện tháng trước trong thư mục Drive.',
    },
    {
      situation: 'Cần AI xử lý định dạng đặc biệt hoặc thao tác công cụ cụ thể',
      choice: 'Gắn thêm Plugin phù hợp',
      reason: 'Mở rộng khả năng cho AI (như đọc PDF nhiều bảng, xuất file báo cáo).',
      example: 'Đọc bảng giá 20 trang PDF và lọc ra 3 lựa chọn tiết kiệm nhất.',
    },
    {
      situation: 'Việc lớn gồm nhiều bước nối tiếp nhau',
      choice: 'Giao cho Agent (Trợ lý tự động)',
      reason: 'Agent kết hợp Skill + MCP + Plugin theo từng bước và dừng lại hỏi bạn ở bước quan trọng.',
      example: 'Đọc lịch tuần này -> kiểm tra việc trùng giờ -> soạn sẵn email nhắc nhở để bạn duyệt.',
    },
  ],
  technicalConfigs: {
    mcpJson: JSON.stringify(
      {
        mcpServers: {
          'google-drive-readonly': {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-gdrive'],
            env: {
              GDRIVE_READ_ONLY: 'true',
              GDRIVE_ALLOWED_FOLDER: 'HoaDonGiaDinh',
            },
          },
        },
      },
      null,
      2
    ),
    skillMd: `---
name: tom-tat-bien-ban-hop
description: Dùng khi cần tóm tắt ghi chép cuộc họp thành bản ngắn gọn, dễ theo dõi cho mọi người.
---

## Khi nào dùng
Khi người dùng gửi ghi chép cuộc họp hoặc đoạn hội thoại dài cần rút gọn.

## Các bước thực hiện
1. Đọc toàn bộ ghi chép và lọc ra các quyết định đã chốt.
2. Liệt kê danh sách việc cần làm kèm tên người phụ trách và hạn hoàn thành.
3. Ghi rõ những câu hỏi còn bỏ ngỏ để hỏi lại sau.

## Công cụ & Kết nối (MCP / Plugin)
- Chỉ cần đọc văn bản người dùng cung cấp (không cần quyền chỉnh sửa file).

## Quy tắc an toàn
- Không tự ý gửi email hoặc chia sẻ biên bản ra ngoài nếu người dùng chưa bấm xác nhận.
- Không suy đoán tên người hoặc số liệu không có trong ghi chép.`,
  },
};

export const NC02_SCENARIOS = [
  {
    id: 'drive-invoices',
    title: 'Tổng hợp hóa đơn từ Drive',
    summary:
      'Nhờ trợ lý tìm hóa đơn tiền điện, nước tháng này trong thư mục Drive rồi lập bảng chi tiêu.',
    steps: [
      {
        type: 'goal',
        title: 'Mục tiêu',
        actor: 'Bạn giao việc',
        detail:
          'Bạn yêu cầu: "Hãy xem giúp tôi các hóa đơn điện, nước tháng này trong thư mục Hóa đơn gia đình và cộng tổng chi phí."',
        glossaryTerm: 'agent',
      },
      {
        type: 'skill',
        title: 'Agent đọc Skill',
        actor: 'Sổ tay quy trình',
        detail:
          'Agent mở Skill "Tổng hợp hóa đơn": biết cần lọc đúng tháng hiện tại, tách riêng từng khoản (điện, nước, internet) và kiểm tra lại phép cộng.',
        glossaryTerm: 'skill',
      },
      {
        type: 'mcp',
        title: 'MCP lấy dữ liệu',
        actor: 'Cổng kết nối an toàn',
        detail:
          'Agent đề nghị kết nối MCP Google Drive ở chế độ chỉ đọc (Read-only) để xem tên file và số tiền trong thư mục "Hóa đơn gia đình".',
        glossaryTerm: 'mcp',
        permissionGate: {
          prompt:
            'Trợ lý xin phép mở thư mục "Hóa đơn gia đình" trên Google Drive ở chế độ CHỈ ĐỌC (không sửa, không xóa file). Bạn có đồng ý không?',
          allowLabel: 'Cho phép đọc (Read-only)',
          denyLabel: 'Từ chối để bảo mật',
          allowOutcome:
            'Đã cấp quyền CHỈ ĐỌC tạm thời. MCP đọc được 3 hóa đơn tháng này (Điện: 620.000đ, Nước: 145.000đ, Internet: 220.000đ) mà không thể sửa hay xóa file gốc.',
          denyOutcome:
            'Bạn đã từ chối kết nối Drive. Trợ lý dừng truy cập dữ liệu riêng tư ngay lập tức và chuyển sang hướng dẫn bạn tự nhập hoặc dán số liệu thủ công.',
        },
      },
      {
        type: 'plugin',
        title: 'Plugin thực thi',
        actor: 'Dụng cụ tính & định dạng',
        detail:
          'Plugin đọc bảng PDF trích xuất đúng 3 dòng số tiền và dùng công cụ tính toán cộng tổng chính xác: 985.000đ.',
        denyFallback:
          'Vì bạn chưa cấp quyền đọc Drive, Plugin tạo sẵn một mẫu bảng trống để bạn tự điền 3 con số vào khi cần.',
        glossaryTerm: 'plugin',
      },
      {
        type: 'result',
        title: 'Kết quả',
        actor: 'Báo cáo gửi bạn duyệt',
        detail:
          'Bạn nhận được bảng tổng hợp rõ ràng: Điện 620.000đ + Nước 145.000đ + Internet 220.000đ = 985.000đ, kèm ghi chú chưa có thao tác ghi hay gửi đi đâu.',
        denyFallback:
          'Bạn nhận được khung bảng mẫu an toàn để tự điền số liệu. Dữ liệu trên Drive của bạn vẫn hoàn toàn riêng tư.',
      },
    ],
  },
  {
    id: 'calendar-email',
    title: 'Kiểm tra Lịch & soạn email',
    summary:
      'Xem lịch khám bệnh / họp gia đình tuần tới rồi soạn sẵn thư nhắc lịch để bạn đọc lại trước khi gửi.',
    steps: [
      {
        type: 'goal',
        title: 'Mục tiêu',
        actor: 'Bạn giao việc',
        detail:
          'Bạn yêu cầu: "Kiểm tra lịch tuần sau xem có ngày nào trống buổi sáng để đặt lịch khám sức khỏe, rồi soạn sẵn email báo cho các con."',
        glossaryTerm: 'agent',
      },
      {
        type: 'skill',
        title: 'Agent đọc Skill',
        actor: 'Sổ tay quy trình',
        detail:
          'Agent đọc Skill "Sắp xếp lịch & Soạn thư gia đình": ưu tiên khung giờ 8h00–10h30 sáng, viết giọng văn ấm áp và luôn dừng lại chờ bạn duyệt trước khi gửi thư.',
        glossaryTerm: 'skill',
      },
      {
        type: 'mcp',
        title: 'MCP lấy dữ liệu',
        actor: 'Cổng kết nối an toàn',
        detail:
          'Agent xin phép dùng MCP Lịch (Calendar) ở chế độ chỉ đọc để xem các khung giờ bận trong tuần tới.',
        glossaryTerm: 'mcp',
        permissionGate: {
          prompt:
            'Trợ lý xin phép xem Lịch tuần tới ở chế độ CHỈ ĐỌC để tìm buổi sáng còn trống. Bạn có cho phép không?',
          allowLabel: 'Cho phép đọc (Read-only)',
          denyLabel: 'Từ chối để bảo mật',
          allowOutcome:
            'Đã cấp quyền CHỈ ĐỌC Lịch tuần tới. MCP thấy Thứ Ba và Thứ Năm buổi sáng từ 8h00 đến 11h00 đều đang trống.',
          denyOutcome:
            'Bạn đã từ chối đọc Lịch. Trợ lý không xem lịch cá nhân mà gợi ý khung mẫu để bạn tự chọn ngày phù hợp.',
        },
      },
      {
        type: 'plugin',
        title: 'Plugin thực thi',
        actor: 'Dụng cụ soạn thảo',
        detail:
          'Plugin soạn bản nháp email gợi ý 2 khung giờ trống (sáng Thứ Ba hoặc sáng Thứ Năm) với tiêu đề rõ ràng, chưa bấm nút gửi.',
        denyFallback:
          'Plugin soạn sẵn một bức thư mẫu có chỗ trống [Điền ngày/giờ bạn chọn] để bạn tự điền trước khi gửi.',
        glossaryTerm: 'plugin',
      },
      {
        type: 'result',
        title: 'Kết quả',
        actor: 'Bản nháp chờ bạn duyệt',
        detail:
          'Bạn xem lại bản nháp email, thấy đúng ý mới tự tay bấm Gửi. Không có email nào bị tự động gửi đi khi chưa có sự đồng ý của bạn.',
        denyFallback:
          'Bạn nhận được mẫu email hoàn chỉnh với ô trống ngày giờ để tự điền, giữ kín toàn bộ lịch trình cá nhân.',
      },
    ],
  },
  {
    id: 'morning-news',
    title: 'Tóm tắt tin mỗi sáng',
    summary:
      'Lọc 3 bản tin sức khỏe và thời tiết địa phương mỗi sáng thành bản đọc chữ lớn, ngắn gọn.',
    steps: [
      {
        type: 'goal',
        title: 'Mục tiêu',
        actor: 'Bạn giao việc',
        detail:
          'Bạn yêu cầu: "Mỗi sáng tóm tắt giúp tôi dự báo thời tiết hôm nay và 3 tin sức khỏe hữu ích cho người lớn tuổi, viết ngắn gọn dễ đọc."',
        glossaryTerm: 'agent',
      },
      {
        type: 'skill',
        title: 'Agent đọc Skill',
        actor: 'Sổ tay quy trình',
        detail:
          'Agent mở Skill "Bản tin buổi sáng": chỉ chọn nguồn tin chính thống, mỗi tin tóm tắt tối đa 2 câu, tránh từ ngữ gây hoang mang.',
        glossaryTerm: 'skill',
      },
      {
        type: 'mcp',
        title: 'MCP lấy dữ liệu',
        actor: 'Cổng kết nối an toàn',
        detail:
          'Agent xin phép kết nối MCP đọc nguồn tin thời tiết & mục ghi chú chủ đề quan tâm mà bạn đã lưu.',
        glossaryTerm: 'mcp',
        permissionGate: {
          prompt:
            'Trợ lý xin phép đọc danh sách chủ đề quan tâm của bạn ở chế độ CHỈ ĐỌC để chọn đúng tin phù hợp. Bạn đồng ý chứ?',
          allowLabel: 'Cho phép đọc (Read-only)',
          denyLabel: 'Từ chối để bảo mật',
          allowOutcome:
            'Đã cấp quyền CHỈ ĐỌC. MCP lấy đúng chủ đề "Thời tiết Hà Nội, dinh dưỡng tim mạch, đi bộ buổi sáng".',
          denyOutcome:
            'Bạn đã từ chối đọc ghi chú cá nhân. Trợ lý sẽ dùng bộ chủ đề phổ thông (thời tiết chung và vận động nhẹ) để minh họa.',
        },
      },
      {
        type: 'plugin',
        title: 'Plugin thực thi',
        actor: 'Dụng cụ lọc & trình bày',
        detail:
          'Plugin lọc bỏ quảng cáo, định dạng lại thành 3 gạch đầu dòng rõ ràng kèm lời khuyên mặc áo ấm hoặc mang ô nếu trời sắp mưa.',
        denyFallback:
          'Plugin trình bày 3 gợi ý chăm sóc sức khỏe buổi sáng theo mẫu chung, không sử dụng dữ liệu cá nhân.',
        glossaryTerm: 'plugin',
      },
      {
        type: 'result',
        title: 'Kết quả',
        actor: 'Bản tin 1 phút mỗi sáng',
        detail:
          'Bạn đọc xong toàn bộ tin chính trong 1 phút với chữ rõ ràng, không bị rối mắt bởi hàng chục đường link quảng cáo.',
        denyFallback:
          'Bạn nhận được bản tin sức khỏe tổng quát gọn gàng mà không chia sẻ bất kỳ ghi chú riêng tư nào.',
      },
    ],
  },
];

export const NC04_TEMPLATES = [
  {
    id: 'skill-meeting-notes',
    title: 'Kỹ năng tóm tắt biên bản họp & việc cần làm',
    domain: 'Công việc & Nhóm cộng đồng',
    mode: 'skill',
    summary:
      'Giúp AI luôn tóm tắt ghi chép cuộc họp thành 3 mục rõ ràng: Quyết định chính, Việc cần làm, Câu hỏi còn mở.',
    fields: {
      name: 'tom-tat-bien-ban-hop',
      trigger:
        'Khi tôi dán nội dung ghi chép cuộc họp hoặc đoạn trao đổi dài của nhóm.',
      steps:
        '1. Đọc kỹ toàn bộ nội dung, không bỏ sót ngày giờ quan trọng.\n2. Tách thành 3 phần: Quyết định đã chốt, Danh sách việc cần làm (Ai làm - Khi nào xong), Điểm cần hỏi lại.\n3. Viết bằng câu ngắn, tiếng Việt phổ thông dễ đọc.',
      tools: 'Chỉ đọc văn bản người dùng dán vào (Read-only, không kết nối gửi mail tự động).',
      safety:
        'Không tự bịa tên người phụ trách nếu biên bản không ghi. Không tự ý gửi biên bản cho người khác khi chưa được duyệt.',
    },
    technicalConfig: {
      json: JSON.stringify(
        {
          skillName: 'tom-tat-bien-ban-hop',
          permissions: { readUserText: true, sendEmail: false, writeFiles: false },
          outputSections: ['QuyetDinhChinh', 'ViecCanLam', 'DiemCanHoiLai'],
        },
        null,
        2
      ),
      cli: 'ai-agent skill check ./skills/tom-tat-bien-ban-hop/SKILL.md --read-only',
    },
  },
  {
    id: 'skill-health-meal',
    title: 'Kỹ năng gợi ý thực đơn tuần nhẹ bụng cho gia đình',
    domain: 'Gia đình & Sức khỏe',
    mode: 'skill',
    summary:
      'Thiết lập quy trình chuẩn để AI gợi ý thực đơn 3 bữa thanh đạm, dễ nấu, kèm danh sách đi chợ gọn gàng.',
    fields: {
      name: 'thuc-don-gia-dinh-nhe-bung',
      trigger:
        'Khi tôi muốn lên thực đơn ăn uống cho người lớn tuổi hoặc gia đình trong 3–7 ngày.',
      steps:
        '1. Hỏi hoặc đọc sở thích ăn uống và món cần kiêng (ví dụ: ít muối, ít đường).\n2. Gợi ý món ăn Việt quen thuộc, nguyên liệu dễ mua ở chợ gần nhà.\n3. Cuối bảng luôn kèm danh sách nguyên liệu cần mua gộp theo nhóm (rau, thịt/cá, gia vị).',
      tools: 'Không cần công cụ ngoài; chỉ dùng kiến thức nấu ăn gia đình phổ thông.',
      safety:
        'Ghi chú rõ đây chỉ là gợi ý tham khảo bữa ăn hằng ngày, không thay thế phác đồ điều trị của bác sĩ.',
    },
    technicalConfig: {
      json: JSON.stringify(
        {
          skillName: 'thuc-don-gia-dinh-nhe-bung',
          constraints: ['it-muoi', 'it-dau-mo', 'nguyen-lieu-pho-thong'],
          disclaimerRequired: true,
        },
        null,
        2
      ),
      cli: 'ai-agent skill validate ./skills/thuc-don-gia-dinh-nhe-bung/SKILL.md',
    },
  },
  {
    id: 'workflow-drive-receipts',
    title: 'Quy trình gom hóa đơn & lập bảng chi tiêu tháng',
    domain: 'Tài chính cá nhân',
    mode: 'workflow',
    summary:
      'Quy trình nhiều bước có điểm dừng kiểm tra: đọc hóa đơn, phân loại khoản chi và chờ bạn duyệt trước khi lưu bảng.',
    fields: {
      name: 'Gom hóa đơn và lập bảng chi tiêu tháng',
      input:
        'Danh sách ảnh hoặc file hóa đơn tiền điện, nước, chợ, thuốc trong tháng (chỉ đọc, chỉ gồm hóa đơn điện, nước, siêu thị thông thường).',
      steps:
        '1. Đọc từng hóa đơn và ghi lại Ngày, Tên khoản chi, Số tiền.\n2. Xếp vào 4 nhóm: Sinh hoạt thiết yếu, Y tế, Ăn uống, Khác.\n3. Cộng tổng từng nhóm và tính tổng chi tiêu cả tháng.',
      checkpoint:
        'Dừng lại hiển thị bảng nháp để tôi kiểm tra từng con số. Chỉ xuất file tổng kết sau khi tôi xác nhận đúng.',
      output:
        'Bảng tổng hợp chi tiêu tháng rõ ràng kèm 2 nhận xét ngắn về khoản tăng giảm so với tháng trước.',
    },
    technicalConfig: {
      json: JSON.stringify(
        {
          workflow: 'gom-hoa-don-chi-tieu',
          mcp: { server: 'gdrive-readonly', mode: 'read-only' },
          humanInTheLoop: { pauseBeforeExport: true },
        },
        null,
        2
      ),
      cli: 'ai-agent run workflow-chi-tieu --mcp gdrive-readonly --confirm-before-write',
    },
  },
  {
    id: 'workflow-travel-plan',
    title: 'Quy trình lên lịch trình du lịch gia đình nhiều bước',
    domain: 'Du lịch & Đời sống',
    mode: 'workflow',
    summary:
      'Chia việc lên kế hoạch đi chơi 3 ngày thành từng bước nhẹ nhàng, phù hợp sức khỏe người lớn tuổi và trẻ nhỏ.',
    fields: {
      name: 'Lên lịch trình du lịch gia đình nhẹ nhàng',
      input:
        'Điểm đến, số ngày đi, số người tham gia (có người lớn tuổi hay trẻ em không) và mức ngân sách dự kiến.',
      steps:
        '1. Đề xuất khung giờ di chuyển thư thả, tránh đi sáng quá sớm hoặc khuya muộn.\n2. Chọn 2 điểm tham quan nhẹ nhàng mỗi ngày, gần nhau để đỡ tốn sức đi bộ.\n3. Gợi ý quán ăn sạch sẽ, dễ ăn và danh sách đồ cần mang (thuốc cá nhân, áo khoác).',
      checkpoint:
        'Sau bước 2, dừng lại hỏi tôi xem lịch trình có bị dày quá không trước khi viết danh sách đồ mang theo.',
      output:
        'Lịch trình theo từng buổi (Sáng - Trưa - Chiều) và bảng kiểm tra hành lý trước khi lên đường.',
    },
    technicalConfig: {
      json: JSON.stringify(
        {
          workflow: 'lich-trinh-du-lich-gia-dinh',
          pace: 'relaxed',
          humanInTheLoop: { confirmItineraryBeforePackingList: true },
        },
        null,
        2
      ),
      cli: 'ai-agent run workflow-du-lich --interactive-checkpoint',
    },
  },
];

export const NC05_SAFETY = {
  title: 'NC-05: Quyền hạn & An toàn khi dùng Agent nâng cao',
  intro:
    'Khi cho AI kết nối với dữ liệu hoặc công cụ bên ngoài, nguyên tắc vàng là: luôn bắt đầu bằng quyền ĐỌC, giữ quyền quyết định cuối cùng ở con người và cảnh giác với nội dung lạ.',
  permissionComparison: {
    read: {
      title: 'Quyền CHỈ ĐỌC (Read-only)',
      badge: 'Khuyên dùng trước tiên',
      points: [
        'AI chỉ được phép xem tài liệu, đọc lịch hoặc tóm tắt nội dung giúp bạn.',
        'Không thể tự ý sửa chữ, xóa file hay gửi tin nhắn cho người khác.',
        'Ví dụ an toàn: "Đọc giúp tôi 3 file hóa đơn trong thư mục này rồi cộng tổng."',
      ],
    },
    write: {
      title: 'Quyền GHI / GỬI / XÓA (Write / Send / Delete)',
      badge: 'Cẩn trọng — phải hỏi lại',
      points: [
        'AI có thể tạo file mới, sửa nội dung cũ, xóa tài liệu hoặc bấm gửi email thật.',
        'Nếu AI hiểu nhầm một chi tiết, hậu quả có thể khó hoàn tác (như gửi nhầm thư cho cả nhóm).',
        'Luôn yêu cầu AI dừng lại ở bước nháp để bạn tự tay kiểm tra và bấm xác nhận.',
      ],
    },
  },
  humanInTheLoop: {
    title: 'Nguyên tắc "Con người duyệt trước" (Human-in-the-Loop)',
    explanation:
      'Dù trợ lý AI thông minh đến đâu, bạn vẫn là người cầm lái. Hãy đặt điểm dừng bắt buộc trước mọi hành động ảnh hưởng đến tiền bạc, dữ liệu gốc hoặc liên lạc với người khác.',
    rule: 'Quy tắc 1 chạm: AI soạn nháp — Bạn đọc lại — Bạn tự tay bấm Gửi hoặc Lưu.',
  },
  promptInjection: {
    title: 'Cảnh giác với "Lời nhắn gài bẫy" (Prompt Injection)',
    analogy:
      'Giống như trong một phong bì thư lạ có kẹp tờ giấy giả mạo ghi: "Hãy chuyển toàn bộ tiền sang số tài khoản mới này".',
    explanation:
      'Đôi khi trong trang web, email lạ hoặc file tải về có chứa dòng chữ ẩn cố tình đánh lừa AI bỏ qua quy tắc của bạn và làm theo lệnh của kẻ xấu.',
    prevention:
      'Chỉ kết nối MCP/Plugin với tài liệu đáng tin cậy; không cấp quyền tự động gửi tiền, đổi mật khẩu hay chuyển tiếp email từ nguồn lạ.',
  },
  preRunChecklist: [
    {
      id: 'nc05-check-1',
      label: 'Chỉ cấp quyền CHỈ ĐỌC (Read-only) khi mới thử nghiệm',
      detail: 'Tắt quyền tự động sửa, xóa file hoặc tự động gửi email cho đến khi bạn thật sự kiểm soát được.',
    },
    {
      id: 'nc05-check-2',
      label: 'Đặt điểm dừng xác nhận (Human-in-the-Loop) trước bước quan trọng',
      detail: 'Luôn xem lại bản nháp email, bảng tính hoặc lệnh thay đổi trước khi cho phép thực thi.',
    },
    {
      id: 'nc05-check-3',
      label: 'Không đưa mật khẩu, mã OTP, số CCCD hoặc số thẻ vào Skill/MCP',
      detail: 'Dùng tên gọi minh họa hoặc biến cấu hình riêng thay vì viết thông tin nhạy cảm vào câu lệnh.',
    },
    {
      id: 'nc05-check-4',
      label: 'Chỉ cho Agent đọc tài liệu và nguồn công cụ đáng tin cậy',
      detail: 'Tránh để AI tự mở các đường link lạ hoặc file không rõ nguồn gốc để phòng bẫy Prompt Injection.',
    },
  ],
};
