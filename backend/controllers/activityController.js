import Activity from "../models/Activity.js";

export const getRecentActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ teacherId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};
