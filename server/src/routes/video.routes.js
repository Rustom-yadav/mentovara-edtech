import { Router } from "express";
import { addVideo, getVideo, deleteVideo } from "../controllers/video.controller.js";
import { verifyJWT, isInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/")
    .post(
        verifyJWT, 
        isInstructor, 
        upload.single("video"), 
        addVideo
    );

router.route("/:videoId")
    .get(verifyJWT, getVideo)
    .delete(verifyJWT, isInstructor, deleteVideo);

export default router;
