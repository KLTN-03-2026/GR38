import Notification from "../models/Notification.js";

export const createNotification = async (title, message, type, referenceId, createdByUserId = null, createdByName = null) => {
  try {
    return await Notification.create({
      title,
      message,
      type,
      referenceId,
      createdByUserId,
      createdByName,
    });
  } catch (error) {
    console.error("Notification create error:", error);
    return null;
  }
};
