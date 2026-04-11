import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'

import authRouter from './router/authRouter.js'
import documentRouter from './router/documentRouter.js'


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


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Router
app.use('/api/auth', authRouter)
app.use('/api/documents', documentRouter)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route Not Found',
        statusCode: 404
    });
});

//khởi động server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.NODE_ENV} mode on port ${PORT}`);
});
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});

