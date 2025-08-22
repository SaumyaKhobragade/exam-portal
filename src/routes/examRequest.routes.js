import { Router } from "express";
import {
    createExamRequest,
    getAllExamRequests,
    reviewExamRequest,
    getExamRequestStats
} from "../controllers/examRequest.controller.js";
import { verifyOwner } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route - anyone can submit a request
router.route("/").post(createExamRequest);

// Owner-only routes
router.route("/all").get(verifyOwner, getAllExamRequests);
router.route("/stats").get(verifyOwner, getExamRequestStats);
router.route("/:requestId/review").patch(verifyOwner, reviewExamRequest);

export default router;
