import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Hệ thống hỗ trợ ôn tập Lịch sử Việt Nam',
            version: '1.0.0',
            description: 'Tài liệu API tích hợp AI (Google Gemini)',
            contact: {
                name: 'HoaiAnh' 
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`,
                description: 'Development server'
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'Các API Quản lý đăng nhập, đăng ký và hồ sơ cá nhân'
            },
            {
                name: 'Admin',
                description: 'Các API dành riêng cho Quản trị viên quản lý hệ thống'
            },
            { name: 'Progress', description: 'Các API theo dõi tiến độ học sinh' } ,
            {
                name: 'Document',
                description: 'Các API quản lý tài liệu PDF (Tải lên, xem danh sách, chi tiết, xóa)'
            },
            {name: 'AI' , description: 'Các API tích hợp AI (Tạo flashcard, tạo quiz)'},
            { name: 'Flashcard', description: 'Các API quản lý bộ thẻ nhớ' }, 
            { name: 'Quiz', description: 'Các API quản lý bài tập trắc nghiệm' }, 
            
            
        ],
        components: { 
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },

    apis: [
        // 1. Đọc các file comment js (nếu bạn vẫn muốn giữ vài cái)
        path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'), 
        // 2. Đọc TOÀN BỘ file .yaml trong thư mục docs
        path.join(__dirname, '../docs/*.yaml').replace(/\\/g, '/') 
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };