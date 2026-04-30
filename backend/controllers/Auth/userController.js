import User from '#models/User.js';


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