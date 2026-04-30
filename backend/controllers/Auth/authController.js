import User, { USER_ROLES, TEACHER_APPROVAL_STATUS } from '#models/User.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import {sendTokenResponse}  from '#controllers/Auth/utils/jwtToken.js';

const client = new OAuth2Client(process.env.GG_CLIENT_ID);

console.log("Email đang dùng:", process.env.EMAIL_USER);
console.log("Mật khẩu đang dùng:", process.env.EMAIL_APP_PASSWORD);

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com', 
//     port: 465, 
//     secure: true, 
//     auth: {
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_APP_PASSWORD, 
//     },

// });

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: '5b951a2767e4cf',
      pass: '87c618f10f7a03'
    }
});
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
 * Đăng nhập & Đăng ký bằng Google (Dành cho ID Token từ <GoogleLogin />)
 * POST /api/auth/google
 */
export const googleAuth = async (req, res, next) => {
    try {
        const { token, role } = req.body; 

        if (!token) {
            return res.status(400).json({ success: false, error: "Thiếu token xác thực từ Google" });
        }

        // 1. Xác minh ID Token bằng google-auth-library
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GG_CLIENT_ID, // ID ứng dụng Google của bạn
        });
        
        // Lấy thông tin user từ Payload
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // 2. Tìm User trong Database
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            if (!role) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Vui lòng chọn vai trò (Người học/Giáo viên) để hoàn tất đăng ký."
                });
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
                // Cập nhật ảnh nếu user chỉ có ảnh mặc định
                if (user.profileImage && user.profileImage.includes('user-a-solid-svgrepo-com')) {
                    user.profileImage = picture;
                }
                await user.save();
            }

            // Kiểm tra trạng thái tài khoản
            if (!user.isActive) {
                return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị vô hiệu hóa.' });
            }
            
            if (user.role === USER_ROLES.TEACHER && user.teacherApprovalStatus !== TEACHER_APPROVAL_STATUS.APPROVED) {
                return res.status(403).json({ success: false, error: 'Tài khoản Teacher của bạn đang chờ duyệt từ Admin.' });
            }
        }

        // 3. Trả về token cho Client sử dụng
        return sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error('Lỗi xác thực Google:', error);
        return res.status(500).json({ success: false, error: "Xác thực Google thất bại." });
    }
};


/**
 * Yêu cầu gửi mã OTP Quên mật khẩu
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Vui lòng cung cấp email' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản với email này' });
        }

        // CHẶN: Tài khoản đăng nhập bằng Google không sử dụng tính năng quên mật khẩu này
        if (user.authType === 'google') {
            return res.status(400).json({ 
                success: false, 
                error: 'Tài khoản của bạn được liên kết với Google. Vui lòng sử dụng tính năng Đăng nhập bằng Google.' 
            });
        }

        // Tạo mã OTP 6 số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu OTP và thời gian hết hạn (10 phút) vào database
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Cấu hình nội dung email
        const mailOptions = {
            from: `"Hệ thống SmartEdu" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Mã OTP khôi phục mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4F46E5; text-align: center;">Khôi Phục Mật Khẩu</h2>
                    <p>Xin chào <strong>${user.fullName}</strong>,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu. Dưới đây là mã xác nhận (OTP) của bạn:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; padding: 10px 20px; background: #f4f4f4; border-radius: 5px;">${otp}</span>
                    </div>
                    <p style="color: #d9534f; font-size: 14px;"><em>Lưu ý: Mã này chỉ có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</em></p>
                    <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ 
            success: true, 
            message: 'Mã OTP đã được gửi đến email của bạn' 
        });

    } catch (error) {
        console.error('Lỗi gửi OTP quên mật khẩu:', error);
        return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi gửi email' });
    }
};


/**
 * Xác thực OTP và Đặt lại mật khẩu
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới' 
            });
        }

        // Tìm user có email khớp, OTP khớp và OTP chưa hết hạn
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOtp: otp,
            resetPasswordOtpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã OTP không hợp lệ hoặc đã hết hạn' 
            });
        }

        // Cập nhật mật khẩu mới (middleware pre-save trong model sẽ tự động hash mật khẩu này)
        user.password = newPassword;
        
        // Xóa thông tin OTP sau khi đã sử dụng thành công
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;

        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' 
        });

    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đặt lại mật khẩu' });
    }
};