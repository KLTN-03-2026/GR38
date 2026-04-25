import jwt from "jsonwebtoken";
import User, { USER_ROLES } from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Người dùng không tồn tại",
          statusCode: 401,
        });
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
          statusCode: 401,
        });
      }

      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
        statusCode: 401,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Không tìm thấy token, quyền truy cập bị từ chối",
      statusCode: 401,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Không tìm thấy thông tin người dùng",
        statusCode: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập chức năng này",
        statusCode: 403,
      });
    }

    next();
  };
};

export { USER_ROLES };
export default protect;