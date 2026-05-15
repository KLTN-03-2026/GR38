import express from "express";
import { getRecentActivities } from "../controllers/activityController.js";
import protect, { authorize, USER_ROLES } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize(USER_ROLES.TEACHER), getRecentActivities);

export default router;
