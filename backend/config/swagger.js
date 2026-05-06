import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Hệ thống hỗ trợ ôn tập Lịch sử Việt Nam",
      version: "1.0.0",
      description: "Tài liệu API tích hợp AI (Google Gemini)",
      contact: {
        name: "HoaiAnh",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: "Development server",
      },
    ],
    tags: [
      // 1. NHÓM XÁC THỰC VÀ NGƯỜI DÙNG (Nền tảng)
      {
        name: "Authentication",
        description: "Các API Quản lý đăng nhập, đăng ký và xác thực",
      },
      {
        name: "User",
        description: "Các API quản lý hồ sơ cá nhân và bảo mật tài khoản",
      },

       // 2. NHÓM QUẢN TRỊ HỆ THỐNG (Mức cao nhất)
      {
        name: "Admin",
        description:
          "Các API dành riêng cho Quản trị viên quản lý toàn bộ hệ thống",
      },
      // 3. NHÓM TÀI NGUYÊN VÀ AI CỐI LÕI (Chuẩn bị dữ liệu)
      {
        name: "Document",
        description:
          "Các API quản lý tài liệu PDF (Tải lên, xem danh sách, chi tiết, xóa)",
      },
      {
        name: "AI",
        description:
          "Các API tích hợp Google Gemini AI (Tạo flashcard, tạo quiz tự động)",
      },

      // 4. NHÓM TÍNH NĂNG HỌC TẬP CHÍNH (Hành trình học)
      {
        name: "Flashcard",
        description: "Các API quản lý và học tập qua bộ thẻ nhớ (Flashcard)",
      },
      {
        name: "Quiz",
        description:
          "Các API quản lý cấu trúc đề thi trắc nghiệm (Tạo, Sửa, Xóa, Lấy đề)",
      },

      // 5. NHÓM ĐÁNH GIÁ VÀ THEO DÕI TIẾN ĐỘ (Kết quả)
      {
        name: "Quiz Result",
        description:
          "Các API xử lý nộp bài, xem lại chi tiết bài làm và thống kê điểm số",
      },
      {
        name: "Progress",
        description: "Các API theo dõi tiến độ và lịch sử học tập của học viên",
      },
      {
        name: "Report",
        description: "Các API báo cáo tổng quan dành cho Giáo viên",
      },
     
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    // 1. Đọc các file comment js (nếu bạn vẫn muốn giữ vài cái)
    path.join(__dirname, "../routes/*.js").replace(/\\/g, "/"),
    // 2. Đọc TOÀN BỘ file .yaml trong thư mục docs
    path.join(__dirname, "../docs/*.yaml").replace(/\\/g, "/"),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
