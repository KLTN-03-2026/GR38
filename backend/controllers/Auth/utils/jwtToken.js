import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res) => {
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