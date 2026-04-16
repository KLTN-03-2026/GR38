import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "LỖI NGHIÊM TRỌNG: GEMINI_API_KEY chưa được thiết lập trong biến môi trường.",
  );
  process.exit(1);
}

/**
 * Tạo danh sách flashcard từ văn bản
 * @param {string} text - Văn bản tài liệu
 * @param {number} count - Số lượng flashcard cần tạo
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Tạo chính xác ${count} flashcard giáo dục về Lịch sử Việt Nam từ văn bản dưới đây.
Định dạng mỗi flashcard bắt buộc như sau:
Q: [Câu hỏi rõ ràng, cụ thể về sự kiện/nhân vật]
A: [Câu trả lời ngắn gọn, chính xác]
D: [Độ khó: Dể, Trung bình, hoặc Khó]

Phân tách mỗi flashcard bằng "---"

Văn bản:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    // Xử lý chuỗi trả về
    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "Trung bình";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diffLower = line.substring(2).trim().toLowerCase();
          // Kiểm tra xem có nằm trong 3 độ khó chuẩn hay không
          if (["dễ", "trung bình", "khó"].includes(diffLower)) {
            if (diffLower === "dễ") difficulty = "Dễ";
            if (diffLower === "trung bình") difficulty = "Trung bình";
            if (diffLower === "khó") difficulty = "Khó";
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Lỗi từ API Gemini:", error);
    throw new Error("Hệ thống tạm thời không thể tạo flashcard.");
  }
};

/**
 * Tạo câu hỏi trắc nghiệm (Quiz)
 * @param {string} text - Văn bản tài liệu
 * @param {number} numQuestions - Số lượng câu hỏi
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Tạo chính xác ${numQuestions} câu hỏi trắc nghiệm Lịch sử Việt Nam từ văn bản dưới đây.
Định dạng mỗi câu hỏi bắt buộc như sau:
Q: [Nội dung câu hỏi]
O1: [Lựa chọn 1]
O2: [Lựa chọn 2]
O3: [Lựa chọn 3]
O4: [Lựa chọn 4]
C: [Đáp án đúng - viết y hệt như văn bản của lựa chọn ở trên]
E: [Giải thích ngắn gọn tại sao đúng]
D: [Độ khó: Dễ, Trung bình, hoặc Khó]
YÊU CẦU BẮT BUỘC (CẦN TUÂN THỦ NGHIÊM NGẶT): 
Giá trị của trường correctAnswer phải copy chính xác 100% từng chữ cái, dấu cách, viết hoa/thường từ một trong 4 giá trị của mảng options.
Phân tách các câu hỏi bằng "---"

Văn bản:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const questions = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "Trung Bình";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diffLower = trimmed.substring(2).trim().toLowerCase();
          if (["dễ", "trung bình", "khó"].includes(diffLower)) {
            if (diffLower === "dễ") difficulty = "Dễ";
            if (diffLower === "trung bình") difficulty = "Trung bình";
            if (diffLower === "khó") difficulty = "Khó";
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Lỗi từ API Gemini:", error);
    throw new Error("Hệ thống tạm thời không thể tạo câu hỏi trắc nghiệm.");
  }
};

/**
 * Tạo bản tóm tắt tài liệu
 * @param {string} text - Văn bản tài liệu
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Cung cấp một bản tóm tắt ngắn gọn cho văn bản Lịch sử Việt Nam dưới đây. 
Hãy làm nổi bật các khái niệm chính, ý chính và các mốc thời gian/nhân vật quan trọng. 
Giữ cho bản tóm tắt rõ ràng, mạch lạc và có cấu trúc tốt (sử dụng gạch đầu dòng để dễ ôn tập).

Văn bản:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Lỗi từ API Gemini:", error);
    throw new Error("Hệ thống tạm thời không thể tạo tóm tắt.");
  }
};

/**
 * Chat và trả lời câu hỏi dựa trên ngữ cảnh tài liệu
 * @param {string} question - Câu hỏi của người dùng
 * @param {Array<Object>} chunks - Các đoạn tài liệu liên quan
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Đoạn ${i + 1}]\n${c.content}`)
    .join("\n\n");

  // console.log("context_____", context);

  const prompt = `Dựa trên ngữ cảnh tài liệu Lịch sử Việt Nam dưới đây, hãy phân tích và trả lời câu hỏi của học sinh.
Nếu câu trả lời không có trong ngữ cảnh, hãy nói rõ là: "Tài liệu hiện tại không có thông tin để trả lời câu hỏi này." Tuyệt đối không tự bịa đặt thêm dữ kiện lịch sử ngoài tài liệu.

Ngữ cảnh:
${context}

Câu hỏi: ${question}

Câu trả lời:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Lỗi từ API Gemini:", error);
    throw new Error("Hệ thống tạm thời không thể xử lý câu hỏi này.");
  }
};

/**
 * Giải thích một khái niệm hoặc sự kiện lịch sử cụ thể
 * @param {string} concept - Khái niệm/Sự kiện cần giải thích
 * @param {string} context - Tài liệu hoặc ngữ cảnh liên quan
 * @returns {Promise<string>} Câu trả lời đã được tạo
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Bạn là một hệ thống AI hỗ trợ ôn tập Lịch sử Việt Nam.
Nhiệm vụ của bạn là giải thích khái niệm hoặc sự kiện: "${concept}".

Hãy dựa HOÀN TOÀN vào ngữ cảnh (Context) được cung cấp dưới đây để giải thích. 

YÊU CẦU BẮT BUỘC (CẦN TUÂN THỦ NGHIÊM NGẶT):
1. ĐI THẲNG VÀO VẤN ĐỀ: Trả lời ngắn gọn, súc tích, khách quan. 
2. KHÔNG DÙNG TỪ NGỮ THỪA: Tuyệt đối KHÔNG có câu chào hỏi, KHÔNG có lời dẫn dắt (vd: "Chào các em", "Hôm nay chúng ta tìm hiểu"), KHÔNG có câu kết luận thừa (vd: "Hy vọng điều này giúp ích").
3. Trình bày rõ ràng, mạch lạc (sử dụng gạch đầu dòng nếu cần).
4. In đậm (**text**) các mốc thời gian, tên nhân vật lịch sử hoặc địa danh quan trọng.
5. NẾU ngữ cảnh không chứa đủ thông tin, chỉ trả lời đúng 1 câu: "Tài liệu hiện tại không đủ thông tin để giải thích chi tiết về vấn đề này." Tuyệt đối không tự bịa đặt thêm.

Ngữ cảnh (Context):
${context.substring(0, 10000)}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Lỗi từ API Gemini:", error);
    throw new Error(
      "Hệ thống tạm thời không thể giải thích khái niệm này. Vui lòng thử lại sau.",
    );
  }
};
