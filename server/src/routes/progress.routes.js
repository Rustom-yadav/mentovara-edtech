import { Router } from "express";
import { getProgress, markVideoComplete } from "../controllers/progress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secured routes
router.use(verifyJWT); // Applying verifyJWT middleware to all routes in this file

router.route("/complete").post(markVideoComplete);
router.route("/:courseId").get(getProgress);

export default router;
