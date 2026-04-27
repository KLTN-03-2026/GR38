import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const documentPdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DATN_History_Web/Documents_PDF', // Thêm chữ _PDF để dễ phân biệt với ảnh bìa
    resource_type: 'raw', 
    format: 'pdf', 
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file PDF!'), false);
  }
};

const uploadPdf = multer({
  storage: documentPdfStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  }
});

// Export chuẩn tên
export default uploadPdf;