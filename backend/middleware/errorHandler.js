const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi máy chủ';

    // Xử lý lỗi CastError của Mongoose (ID không hợp lệ)
    if (err.name === 'CastError') {
        message = 'Không tìm thấy tài nguyên';
        statusCode = 404;
    }

    // Xử lý lỗi trùng dữ liệu 
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} đã tồn tại`; 
        statusCode = 400;
    }

    // Xử lý lỗi validation của Mongoose
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // Xử lý lỗi kích thước file từ Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Kích thước file vượt quá giới hạn cho phép (tối đa 10MB)';
        statusCode = 400;
    }

    // Xử lý lỗi loại file không hợp lệ
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Loại file không được hỗ trợ';
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Token không hợp lệ';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token đã hết hạn';
        statusCode = 401;
    }

    // Log error chi tiết 
    console.error('Lỗi:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Gửi response lỗi
    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;