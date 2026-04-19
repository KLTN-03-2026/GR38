import User, { USER_ROLES } from '../models/User.js';

//@desc   Lấy tất cả người dùng (Có hỗ trợ lọc theo role)
//@route  GET /api/admin/users
//@access Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    // Chuẩn hóa role filter để hỗ trợ đầu vào không đồng nhất hoa/thường.
    const normalizedRole = typeof req.query.role === 'string'
      ? req.query.role.toUpperCase()
      : null;
    const query = normalizedRole ? { role: normalizedRole } : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Xem chi tiết 1 tài khoản
//@route  GET /api/admin/users/:id
//@access Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Cập nhật trạng thái tài khoản (Duyệt giáo viên / Khóa tài khoản)
//@route  PUT /api/admin/users/:id
//@access Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const { teacherApprovalStatus, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy người dùng' 
      });
    }

    // Khóa hoặc Mở khóa tài khoản
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    // Cập nhật trạng thái duyệt
    if (teacherApprovalStatus) {
      if (user.role !== USER_ROLES.TEACHER) {
        return res.status(400).json({
          success: false,
          error: 'Tính năng duyệt hồ sơ (teacherApprovalStatus) chỉ áp dụng cho Giáo viên.'
        });
      }
      user.teacherApprovalStatus = teacherApprovalStatus;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái tài khoản thành công',
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        teacherApprovalStatus: user.teacherApprovalStatus 
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Xóa tài khoản
//@route  DELETE /api/admin/users/:id
//@access Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản thành công',
    });
  } catch (error) {
    next(error);
  }
};