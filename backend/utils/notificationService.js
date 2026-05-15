import Notification from "../models/Notification.js";

export const createNotification = async (title, message, type, referenceId) => {
  try {
    return await Notification.create({
      title,
      message,
      type,
      referenceId,
    });
  } catch (error) {
    console.error("Notification create error:", error);
    return null;
  }
};
