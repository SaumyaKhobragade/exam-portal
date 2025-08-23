import { Router } from "express";
import {
    getAdminProfile,
    getAssignedExams,
    getAdminStats,
    updateAdminProfile,
    getAdminExams,
    activateExam,
    deactivateExam,
    deleteExam
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

// Exam management routes
router.route("/exams").get(getAdminExams);
router.route("/exams/:examId/activate").patch(activateExam);
router.route("/exams/:examId/deactivate").patch(deactivateExam);
router.route("/exams/:examId").delete(deleteExam);

export default router;
