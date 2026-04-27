"use server"

import { GoogleGenAI } from '@google/genai';

export async function generateExamFromImageAction(imageBase64: string, grade: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Chưa cài đặt GEMINI_API_KEY. Vui lòng thêm vào file .env hoặc cấu hình hệ thống.' };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean the base64 string
  let base64Data = imageBase64;
  const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  if (mimeMatch) {
     base64Data = imageBase64.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, "");
  }

  const prompt = `
Bạn là một chuyên gia ra đề thi sát hạch toán học. Tôi cung cấp một đề bài mẫu qua ảnh.
Nhiệm vụ của bạn là TẠO MỘT BẢN SAO Y HỆT đề bài này về mọi mặt, CHỈ THAY ĐỔI DUY NHẤT CÁC CON SỐ để tạo thành 1 mã đề mới tương đương.

NHIỆM VỤ CỰC KỲ KHẮT KHE:
1. CLONE 100% CẤU TRÚC VÀ ĐỘ KHÓ: Bạn KHÔNG được tự ý sáng tác bối cảnh mới, KHÔNG ĐƯỢC tóm tắt hay làm câu hỏi dễ đi. Hãy bưng NGUYÊN VĂN TỪNG CHỮ, độ dài, độ khó, và mọi logic của câu hỏi gốc. SAU ĐÓ, bạn CHỈ THAY THẾ CÁC SỐ LIỆU trong câu bằng các con số khác có cùng quy mô (độ lớn tương đương).
2. XỬ LÝ HÌNH ẢNH MINH HỌA: Vì bạn không thể vẽ hình, nếu câu bài gốc có hình vẽ hoặc biểu đồ cần thiết để giải, bạn PHẢI bồi đắp bằng chữ để miêu tả hình vẽ đó một cách tường minh cho bức tranh toán học mới. (Ví dụ: bổ sung dòng "Đề bài có hình minh họa: Một hình chữ nhật có chiều dài là ... và chiều rộng là ...").
3. BẢO TOÀN SỐ LƯỢNG VÀ THỂ LOẠI: Phải sinh đúng, đủ số lượng câu hỏi y như ảnh gốc. Giữ nguyên dạng "Tự Điền Đáp Số/Tính Nhẩm" ("FILL_IN") hoặc "Trắc Nghiệm có sẵn A B C D" ("MULTIPLE_CHOICE").
4. RÀNG BUỘC TOÁN HỌC: 
   - Số sinh ra phải hợp lý với ngữ cảnh.
   - Đáp án tính toán ra CUỐI CÙNG BẮT BUỘC LUÔN LÀ SỐ TỰ NHIÊN DƯƠNG. Phép chia không bị dư. Không phân số, không số thập phân.
5. FORMAT KẾT QUẢ: Trả về DUY NHẤT LÀ MỘT MẢNG JSON theo cấu trúc sau (không bọc trong thẻ markdown chứa mã code, không kèm văn xuôi):
[
  {
    "type": "FILL_IN", // Dùng "FILL_IN" nếu dạng tự giải/điền số, "MULTIPLE_CHOICE" nếu trắc nghiệm.
    "questionText": "Nguyên văn nội dung câu hỏi... [Kèm miêu tả hình ảnh bằng chữ nếu bản gốc có hình]",
    "options": ["Đáp án 1", "Đáp án 2"], // Trống [] (mảng rỗng) nếu type là FILL_IN.
    "correctAnswer": "Giá trị của đáp án đúng cuối cùng" // Chuỗi ghi nhận 1 đáp án chuẩn xác.
  }
]
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            {
               role: 'user', 
               parts: [
                 { inlineData: { data: base64Data, mimeType } },
                 { text: prompt },
               ]
            }
        ]
    });

    const text = response.text;
    if (!text) return { success: false, error: "AI trả về kết quả rỗng" };

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
       return { success: false, error: "Không giải mã được định dạng của AI. Vui lòng thử lại." };
    }

    return { success: true, data: JSON.parse(jsonMatch[0]) };
    
  } catch (error: any) {
     console.error(error);
     return { success: false, error: error.message || "Có lỗi xảy ra khi giao tiếp với AI" };
  }
}

export async function extractOriginalExamFromImageAction(imageBase64: string, grade: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Chưa cài đặt GEMINI_API_KEY. Vui lòng thêm vào file .env hoặc cấu hình hệ thống.' };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean the base64 string
  let base64Data = imageBase64;
  const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  if (mimeMatch) {
     base64Data = imageBase64.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, "");
  }

  const prompt = `
Bạn là một chuyên gia nhận dạng đề thi toán học. Tôi cung cấp một đề bài mẫu qua ảnh.
Nhiệm vụ của bạn là TRÍCH XUẤT CHÍNH XÁC NGUYÊN VĂN các câu hỏi trong ảnh và giải chúng để tìm ra đáp án.
BẠN KHÔNG ĐƯỢC THAY ĐỔI BẤT KỲ CON SỐ HAY NỘI DUNG NÀO SO VỚI ẢNH GỐC.

NHIỆM VỤ CỰC KỲ KHẮT KHE:
1. TRÍCH XUẤT 100% NỘI DUNG GỐC: Nhận diện chính xác từng câu hỏi, từng con số, từng đáp án trắc nghiệm có trong ảnh. Không được chế thêm.
2. XỬ LÝ HÌNH ẢNH MINH HỌA: Nếu câu bài gốc có hình vẽ hoặc biểu đồ cần thiết để giải, bạn PHẢI bồi đắp bằng chữ để miêu tả hình vẽ đó một cách tường minh.
3. GIẢI TOÁN VÀ ĐIỀN ĐÁP ÁN: Bạn hãy giải các bài toán gốc này và điền giá trị đúng vào correctAnswer.
4. BẢO TOÀN SỐ LƯỢNG VÀ THỂ LOẠI: Phải sinh đúng, đủ số lượng câu hỏi y như ảnh gốc. Giữ nguyên dạng "Tự Điền Đáp Số/Tính Nhẩm" ("FILL_IN") hoặc "Trắc Nghiệm có sẵn A B C D" ("MULTIPLE_CHOICE").
5. FORMAT KẾT QUẢ: Trả về DUY NHẤT LÀ MỘT MẢNG JSON theo cấu trúc sau (không bọc trong thẻ markdown chứa mã code, không kèm văn xuôi):
[
  {
    "type": "FILL_IN", // Dùng "FILL_IN" nếu dạng tự giải/điền số, "MULTIPLE_CHOICE" nếu trắc nghiệm.
    "questionText": "Nguyên văn nội dung câu hỏi... [Kèm miêu tả hình ảnh bằng chữ nếu bản gốc có hình]",
    "options": ["Đáp án 1", "Đáp án 2"], // Trống [] (mảng rỗng) nếu type là FILL_IN.
    "correctAnswer": "Giá trị của đáp án đúng cuối cùng" // Chuỗi ghi nhận 1 đáp án chuẩn xác.
  }
]
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            {
               role: 'user', 
               parts: [
                 { inlineData: { data: base64Data, mimeType } },
                 { text: prompt },
               ]
            }
        ]
    });

    const text = response.text;
    if (!text) return { success: false, error: "AI trả về kết quả rỗng" };

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
       return { success: false, error: "Không giải mã được định dạng của AI. Vui lòng thử lại." };
    }

    return { success: true, data: JSON.parse(jsonMatch[0]) };
    
  } catch (error: any) {
     console.error(error);
     return { success: false, error: error.message || "Có lỗi xảy ra khi giao tiếp với AI" };
  }
}
