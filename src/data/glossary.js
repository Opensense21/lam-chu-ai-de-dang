export const GLOSSARY_TERMS = [
  {
    id: 'ai',
    term: 'AI',
    plainName: 'Trí tuệ nhân tạo (Trợ lý máy tính thông minh)',
    meaning:
      'Phần mềm máy tính được huấn luyện từ lượng lớn văn bản và kiến thức để hiểu câu hỏi tiếng Việt và trả lời giống như một người trợ lý.',
    analogy:
      'Giống như một người thư ký rất chăm chỉ, đọc nhiều sách báo, luôn sẵn sàng giải thích hoặc viết nháp giúp bạn bất cứ lúc nào.',
    example:
      'Ví dụ: Nhờ AI tóm tắt một bài báo dài thành 5 gạch đầu dòng dễ đọc.',
  },
  {
    id: 'prompt',
    term: 'Prompt',
    plainName: 'Câu lệnh / Lời nhờ AI',
    meaning:
      'Đoạn chữ bạn gõ để nhờ AI làm một việc gì đó. Bạn nói càng rõ ràng, đầy đủ ý thì AI trả lời càng sát mong muốn ngay từ lần đầu.',
    analogy:
      'Giống như tờ giấy ghi chú bạn đưa cho đầu bếp: ghi rõ món gì, ít cay, không hành thì món ăn ra đúng ý hơn nhiều.',
    example:
      'Ví dụ: "Hãy đóng vai bác sĩ dinh dưỡng, gợi ý thực đơn 3 bữa nhẹ bụng cho người 65 tuổi bị tiểu đường."',
  },
  {
    id: 'context',
    term: 'Context',
    plainName: 'Bối cảnh / Hoàn cảnh cụ thể',
    meaning:
      'Thông tin nền bạn kể thêm cho AI biết (bạn là ai, viết cho ai đọc, mục đích dùng để làm gì) để AI không đoán mò.',
    analogy:
      'Giống như khi đi mua thuốc, bạn nói rõ tuổi tác và triệu chứng để dược sĩ tư vấn đúng loại phù hợp nhất.',
    example:
      'Ví dụ: "Tôi đang viết thư cảm ơn gửi cho hàng xóm lớn tuổi vì đã giúp trông nhà cuối tuần."',
  },
  {
    id: 'hallucination',
    term: 'Hallucination',
    plainName: 'AI "bịa" hoặc đoán nhầm thông tin',
    meaning:
      'Hiện tượng AI trả lời rất tự tin nhưng nội dung lại sai sự thật hoặc tự nghĩ ra số liệu, trích dẫn không có thật.',
    analogy:
      'Giống như một người bạn nhớ mang máng câu chuyện rồi kể lại như thật. Vì vậy, việc quan trọng như y tế, pháp luật, tiền bạc luôn cần kiểm tra lại.',
    example:
      'Ví dụ: AI có thể nhớ nhầm số điện thoại đường dây nóng hoặc tên một điều luật cũ.',
  },
  {
    id: 'agent',
    term: 'Agent',
    plainName: 'Trợ lý AI tự động làm nhiều bước',
    meaning:
      'Khác với AI hỏi một câu đáp một câu, Agent biết tự chia nhỏ việc lớn thành từng bước, chọn công cụ phù hợp và làm lần lượt cho đến khi xong.',
    analogy:
      'Giống như nhân viên giao việc trọn gói: bạn giao "chuẩn bị chuyến đi Đà Lạt", người đó tự xem thời tiết, lên lịch trình và gợi ý đồ cần mang.',
    example:
      'Ví dụ: Agent tự đọc email dài, lọc ra 3 việc cần làm hôm nay rồi xếp thành danh sách theo thứ tự ưu tiên.',
  },
  {
    id: 'skill',
    term: 'Skill',
    plainName: 'Kỹ năng / Quy trình mẫu dạy sẵn cho AI',
    meaning:
      'Một bản hướng dẫn viết sẵn các bước làm việc chuẩn để mỗi lần cần, AI cứ theo đúng quy trình đó mà làm, không cần nhắc lại từ đầu.',
    analogy:
      'Giống như cuốn sổ tay công thức nấu ăn gia truyền: chỉ cần mở đúng trang công thức là ai làm theo cũng ra vị chuẩn như nhau.',
    example:
      'Ví dụ: Skill "Tóm tắt biên bản họp" luôn chia kết quả thành 3 phần: Quyết định chính, Người phụ trách, Hạn chót.',
  },
  {
    id: 'mcp',
    term: 'MCP',
    plainName: 'Cổng kết nối chuẩn cho AI (Model Context Protocol)',
    meaning:
      'Chuẩn kết nối giúp AI đọc hoặc thao tác an toàn với dữ liệu bên ngoài như lịch, thư mục, ghi chú hoặc cơ sở dữ liệu theo quyền bạn cho phép.',
    analogy:
      'Giống như ổ cắm điện chuẩn quốc tế: bất kỳ thiết bị nào đúng chuẩn đều cắm vào dùng được an toàn mà không phải chế dây riêng.',
    example:
      'Ví dụ: Kết nối MCP với Google Drive để AI tìm giúp bạn đúng file hóa đơn tháng trước.',
  },
  {
    id: 'plugin',
    term: 'Plugin',
    plainName: 'Tiện ích mở rộng gắn thêm cho AI',
    meaning:
      'Mảnh ghép cài thêm để AI có thêm khả năng mới mà mặc định chưa có, chẳng hạn đọc file PDF đặc biệt, tra vé tàu hoặc tạo biểu đồ.',
    analogy:
      'Giống như các ứng dụng bạn cài thêm vào điện thoại: điện thoại vốn chỉ nghe gọi, cài thêm bản đồ thì biết chỉ đường.',
    example:
      'Ví dụ: Plugin đọc tài liệu giúp AI xem bảng giá PDF dài 20 trang và lọc ra sản phẩm rẻ nhất.',
  },
  {
    id: 'token',
    term: 'Token',
    plainName: 'Đơn vị đếm chữ của AI',
    meaning:
      'AI không đếm từng chữ cái như người mà chia câu chữ thành từng mảnh nhỏ gọi là Token. Câu càng dài thì tốn càng nhiều Token.',
    analogy:
      'Giống như cước tin nhắn ngày xưa tính theo số ký tự: viết gọn, đúng trọng tâm thì AI hiểu nhanh và đỡ bị quên phần đầu.',
    example:
      'Ví dụ: Một đoạn văn tiếng Việt khoảng 100 từ thường tương đương khoảng 150–200 Token.',
  },
];

export function findGlossaryTerm(termIdOrName) {
  if (typeof termIdOrName !== 'string') return null;
  const query = termIdOrName.trim().toLowerCase();
  if (!query) return null;

  return (
    GLOSSARY_TERMS.find(
      (entry) =>
        entry.id.toLowerCase() === query || entry.term.toLowerCase() === query
    ) || null
  );
}
