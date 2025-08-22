import { Router } from "express";
import {
    getAdminProfile,
    getAssignedExams,
    getAdminStats,
    updateAdminProfile
} from "../controllers/admin.controller.js";
import { verifyAdminOrOwner } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require admin authentication
router.use(verifyAdminOrOwner);

// Admin profile routes
router.route("/profile").get(getAdminProfile);
router.route("/profile").patch(updateAdminProfile);

// Admin dashboard routes
router.route("/assigned-exams").get(getAssignedExams);
router.route("/stats").get(getAdminStats);

export default router;
