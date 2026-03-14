import { Router } from "express";
import {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollInCourse
} from "../controllers/course.controller.js";
import { verifyJWT, isInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/")
    .get(getCourses)
    .post(
        verifyJWT,
        isInstructor,
        upload.single("thumbnail"),
        createCourse
    );

router.route("/:courseId")
    .get(getCourseById)
    .patch(
        verifyJWT,
        isInstructor,
        upload.single("thumbnail"),
        updateCourse
    )
    .delete(verifyJWT, isInstructor, deleteCourse);

router.route("/:courseId/enroll").post(verifyJWT, enrollInCourse);

export default router;
