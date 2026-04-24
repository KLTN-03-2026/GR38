import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình Storage cho Ảnh Đại Diện (Avatar)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DATN_History_Web/Avatars', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// 3. Cấu hình Storage cho Ảnh Bìa Tài Liệu (Document)
const documentImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DATN_History_Web/Documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// 4. Khởi tạo 2 middleware multer riêng biệt
export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadDocumentImage = multer({ storage: documentImageStorage });