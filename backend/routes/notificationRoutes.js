import express from "express";
import {
  getStudentNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getStudentNotifications);
router.patch("/:id/read", markNotificationAsRead);

export default router;
