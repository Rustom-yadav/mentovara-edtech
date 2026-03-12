import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ─── MIDDLEWARES ─────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── ROUTES IMPORT ──────────────────────────────────────────
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import videoRouter from "./routes/video.routes.js";
import progressRouter from "./routes/progress.routes.js";

// ─── ROUTES DECLARATION ────────────────────────────────────
app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/progress", progressRouter);

// ─── HEALTH CHECK ──────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Mentovara API is running!",
    });
});

// ─── ERROR HANDLING MIDDLEWARE ───────────────────────────────
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app };
