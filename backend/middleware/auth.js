import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES } from "../models/User.js";

// Thay đổi ở file: backend/middleware/auth.js
const protect = async (req, res, next) => {
  let token;

  //kiểm tra xem token có tồn tại trong header không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token để lấy user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password"); // Lấy thông tin người dùng, loại bỏ trường password

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Người dùng không tồn tại",
          statusCode: 401,
        });
      }

      next();
    } catch (error) {
      console.error("Lỗi xác thực token:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token đã hết hạn",
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
      error: "Không có token, truy cập bị từ chối",
      statusCode: 401,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Không có thông tin người dùng",
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
