import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upLoadDir = path.join(__dirname, '../upload/documents');
if(!fs.existsSync(upLoadDir)) {
    fs.mkdirSync(upLoadDir, {recursive: true} );
}

//Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, upLoadDir);
    },
    filename: (req, file, cb) => { 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);

    }
});

//Dùng để lọc file, chỉ cho phép PDF
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép file PDF'),false);
    }
};

//Khởi tạo multer với cấu hình
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // Giới hạn kích thước file 10MB
    }
});

export default upload;