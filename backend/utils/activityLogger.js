import Activity from "../models/Activity.js";

export const logActivity = async (teacherId, actionType, targetType, targetName) => {
  try {
    await Activity.create({
      teacherId,
      actionType,
      targetType,
      targetName,
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
};
