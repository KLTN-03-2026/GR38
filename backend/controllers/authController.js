import jwt from 'jsonwebtoken';
import User, { USER_ROLES } from '../models/User.js';

/**
 * Hàm phụ trợ: Tạo JWT token và trả về response
 */
const sendTokenResponse = (user, statusCode, res) => {
    // Tạo JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    // Trả về response
    return res.status(statusCode).json({
        success: true,
        token,
        data: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            teacherApprovalStatus: user.teacherApprovalStatus,
            isActive: user.isActive,
            profileImage: user.profileImage,
            createdAt: user.createdAt
        }
    });
};

/**
 * Đăng ký tài khoản
 * POST /api/auth/register
 * Body: { fullName, email, password, role }
 */
export const register = async (req, res, next) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Kiểm tra input
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cung cấp đầy đủ thông tin: fullName, email, password, role'
            });
        }

        // Kiểm tra role có hợp lệ không
        if (!Object.values(USER_ROLES).includes(role)) {
            return res.status(400).json({
                success: false,
                error: `Role không hợp lệ. Các role hợp lệ là: ${Object.values(USER_ROLES).join(', ')}`
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email đã được sử dụng'
            });
        }

        // Tạo user mới
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            role
        });

        // Lưu user vào DB (pre-save hook sẽ tự động hash password và set teacherApprovalStatus)
        await user.save();

        // Tạo JWT token và trả về response
        return sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Lỗi khi đăng ký tài khoản'
        });
    }
};

/**
 * Đăng nhập
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cung cấp email và password'
            });
        }

        // Tìm user theo email (select password vì nó được ẩn trong schema)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra password
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                error: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra quyền đăng nhập
        const canLogin = user.canLogin();
        if (!canLogin) {
            // Phân biệt trường hợp: Teacher chưa được duyệt vs Learner/Admin bị vô hiệu hóa
            if (user.role === USER_ROLES.TEACHER) {
                return res.status(403).json({
                    success: false,
                    error: 'Tài khoản Teacher của bạn đang chờ duyệt từ Admin. Vui lòng liên hệ với quản trị viên.'
                });
            } else {
                return res.status(403).json({
                    success: false,
                    error: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên.'
                });
            }
        }

        // Tạo JWT token và trả về response
        return sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Lỗi khi đăng nhập'
        });
    }
};

