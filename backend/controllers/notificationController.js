import Notification from "../models/Notification.js";

export const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const userId = req.user?._id?.toString();
    const data = notifications.map((notification) => {
      const isRead = userId
        ? notification.readBy?.some(
            (readerId) => readerId.toString() === userId,
          )
        : false;

      return {
        ...notification,
        isRead,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi lấy thông báo",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Thiếu ID thông báo",
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: req.user._id } },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông báo",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc",
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông báo:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi cập nhật thông báo",
    });
  }
};
