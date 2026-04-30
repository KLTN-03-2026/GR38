import jwt from 'jsonwebtoken';
import User, { USER_ROLES, TEACHER_APPROVAL_STATUS } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

// Khởi tạo Google Client
const client = new OAuth2Client(process.env.GG_CLIENT_ID);

/**
 * Hàm phụ trợ: Tạo JWT token và trả về response
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

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
            authType: user.authType, 
            createdAt: user.createdAt
        }
    });
};

/**
 * Đăng ký tài khoản (Dành cho Email/Password truyền thống)
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const { fullName, email, password, passwordConfirm, role } = req.body;

        if (!fullName || !email || !password || !passwordConfirm || !role) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cung cấp đầy đủ thông tin: fullName, email, password, passwordConfirm, role'
            });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({
                success: false,
                error: 'Mật khẩu xác nhận không khớp'
            });
        }

        if (role === USER_ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                error: 'Hành động từ chối. Không thể tự đăng ký quyền Quản trị viên.'
            });
        }

        if (!Object.values(USER_ROLES).includes(role)) {
            return res.status(400).json({
                success: false,
                error: `Role không hợp lệ. Các role hợp lệ là: ${Object.values(USER_ROLES).join(', ')}`
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email đã được sử dụng'
            });
        }

        // Ghi chú rõ authType là local
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            role,
            authType: 'local' 
        });

        await user.save();
        return sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        return res.status(500).json({
            success: false,
            error: 'Lỗi máy chủ khi đăng ký tài khoản'
        });
    }
};

/**
 * Đăng nhập (Dành cho Email/Password truyền thống)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cung cấp email và password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không đúng' });
        }

        // CHẶN: Nếu tài khoản này tạo bằng Google thì không có mật khẩu để login kiểu này
        if (user.authType === 'google' && !user.password) {
            return res.status(400).json({
                success: false,
                error: 'Tài khoản này được liên kết với Google. Vui lòng chọn "Đăng nhập bằng Google".'
            });
        }

        // ĐÃ FIX: matchPassword -> comparePassword
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không đúng' });
        }

        // ĐÃ FIX: Thay thế canLogin() bằng logic kiểm tra trực tiếp
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị vô hiệu hóa.' });
        }
        
        if (user.role === USER_ROLES.TEACHER && user.teacherApprovalStatus !== TEACHER_APPROVAL_STATUS.APPROVED) {
            return res.status(403).json({ success: false, error: 'Tài khoản Teacher của bạn đang chờ duyệt từ Admin.' });
        }

        return sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).json({ success: false, error: error.message || 'Lỗi khi đăng nhập' });
    }
};

/**
 * MỚI: Đăng nhập & Đăng ký bằng Google
 * POST /api/auth/google
 */
export const googleAuth = async (req, res, next) => {
    try {
        const { token, role } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, error: "Thiếu token xác thực từ Google" });
        }

        // 1. Xác minh Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GG_CLIENT_ID,
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // 2. Tìm User
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // NẾU CHƯA CÓ: TẠO MỚI (Cần role từ Frontend)
            if (!role) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Vui lòng chọn vai trò (Người học/Giáo viên) để hoàn tất đăng ký."});
            }

            user = new User({
                fullName: name,
                email: email.toLowerCase(),
                profileImage: picture,
                role: role,
                googleId: googleId,
                authType: 'google'
            });
            await user.save();
        } else {
            // NẾU ĐÃ CÓ NHƯNG LÀ TÀI KHOẢN LOCAL -> LIÊN KẾT GOOGLE
            if (!user.googleId) {
                user.googleId = googleId;
                // Có thể cập nhật ảnh nếu họ chưa có ảnh đại diện
                if (user.profileImage.includes('user-a-solid-svgrepo-com')) {
                    user.profileImage = picture;
                }
                await user.save();
            }

            // ĐÃ FIX: Thay thế canLogin() bằng logic kiểm tra trực tiếp
            if (!user.isActive) {
                return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị vô hiệu hóa.' });
            }
            
            if (user.role === USER_ROLES.TEACHER && user.teacherApprovalStatus !== TEACHER_APPROVAL_STATUS.APPROVED) {
                return res.status(403).json({ success: false, error: 'Tài khoản Teacher của bạn đang chờ duyệt từ Admin.' });
            }
        }

        // 3. Trả về token
        return sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error("Lỗi Google Auth:", error);
        return res.status(500).json({ success: false, error: "Xác thực Google thất bại." });
    }
};

/**
 * Lấy thông tin profile người dùng hiện tại
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                teacherApprovalStatus: user.teacherApprovalStatus,
                isActive: user.isActive,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Lỗi lấy profile:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Lỗi khi lấy thông tin profile'
        });
    }
};

/**
 * Cập nhật profile người dùng hiện tại
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { fullName, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // 1. Cập nhật tên
        if (fullName) user.fullName = fullName;

        // 2. Cập nhật email (Kiểm tra trùng lặp)
        if (email) {
            const normalizedEmail = email.toLowerCase();
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email đã được sử dụng'
                });
            }

            user.email = normalizedEmail;
        }

        // 3. Cập nhật ảnh đại diện 
        if (req.file) {
            user.profileImage = req.file.path; 
        } else if (profileImage !== undefined) {
            user.profileImage = profileImage;
        }

        // Lưu thông tin
        await user.save();

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                teacherApprovalStatus: user.teacherApprovalStatus,
                isActive: user.isActive,
                profileImage: user.profileImage, 
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            message: 'Cập nhật thông tin thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật profile:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Lỗi khi cập nhật profile'
        });
    }
};

/**
 * Đổi mật khẩu
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        // CHẶN: Tài khoản Google không có mật khẩu để đổi
        if (user.authType === 'google' && !user.password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tài khoản của bạn đăng nhập bằng Google nên không có mật khẩu. Không thể thực hiện chức năng này.' 
            });
        }

        // ĐÃ FIX: matchPassword -> comparePassword
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        return res.status(500).json({ success: false, error: error.message || 'Lỗi khi đổi mật khẩu' });
    }
};