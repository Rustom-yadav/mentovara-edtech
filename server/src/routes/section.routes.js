import { Router } from "express";
import {
    addSection,
    updateSection,
    getCourseSections,
    deleteSection
} from "../controllers/section.controller.js";
import { verifyJWT, isInstructor } from "../middlewares/auth.middleware.js";

const router = Router();

// Only logged in allowed
router.use(verifyJWT);

// Create a new section
router.route("/:courseId").post(isInstructor, addSection);

// Get sections by course id
router.route("/course/:courseId").get(getCourseSections);

// Manage a specific section
router.route("/:sectionId")
    .patch(isInstructor, updateSection)
    .delete(isInstructor, deleteSection);

export default router;
