import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { swaggerUi, swaggerDocs } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// Import Route dành riêng cho người học (Learner)
import learnerDashboardRoutes from './routes/dashboardLearnerRoutes.js';
// ES6 module: Cách thay thế cho __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Khởi tạo ứng dụng express
const app = express();
// Kết nối đến MongoDB
connectDB();

// Middleware xử lý CORS
app.use(
    cors({
        origin: '*', // Cho phép tất cả các nguồn truy cập
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
        allowedHeaders: ['Content-Type', 'Authorization'], 
        credentials: true, // Cho phép gửi cookie
    })
);
// Middleware để phân tích JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'upload', 'documents')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'upload', 'avatars')));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customSiteTitle: "API Docs - AI History Learning"
  })
);
// --- ROUTES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/admin', adminRoutes);

// Đấu nối API Dashboard cho người học ở đây
app.use('/api/v1/learner-dashboard', learnerDashboardRoutes);

// Middleware xử lý lỗi (Phải đặt sau các Routes)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route Not Found',
        statusCode: 404
    });
});

// Khởi động server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📚 Swagger Docs đang chạy tại: http://localhost:${PORT}/docs`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
