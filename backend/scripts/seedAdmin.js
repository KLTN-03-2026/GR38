import mongoose from 'mongoose';
import User, { USER_ROLES } from '#models/User.js'; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        console.log('Đang kết nối Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Kết nối Database thành công!');

        // Kiểm tra xem đã có Admin nào chưa
        const adminExists = await User.findOne({ role: USER_ROLES.ADMIN });
        
        if (adminExists) {
            console.log('Tài khoản Admin đã tồn tại! Không cần tạo thêm.');
            process.exit();
        }

        // Tạo tài khoản Admin
        const adminUser = new User({
            fullName: 'Admin',
            email: 'admin@gmail.com', 
            password: 'admin123',   
            role: USER_ROLES.ADMIN,
            teacherApprovalStatus: 'approved', 
            isActive: true
        });

        await adminUser.save();
        console.log('Chúc mừng! Tạo tài khoản Admin thành công!');
        process.exit();
    } catch (error) {
        console.error('Lỗi khi khởi tạo Admin:', error);
        process.exit(1);
    }
};

seedAdmin();