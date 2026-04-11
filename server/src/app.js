import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ 
    limit: "1mb",
    verify: (req, res, buf) => {
        req.rawBody = buf.toString(); // Store raw chunks for Razorpay Signature Verification
    }
}));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import videoRouter from "./routes/video.routes.js";
import sectionRouter from "./routes/section.routes.js";
import progressRouter from "./routes/progress.routes.js";
import paymentRouter from "./routes/payment.routes.js";

// Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/sections", sectionRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/payments", paymentRouter);

// Health Check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Mentovara API is running!",
    });
});

// Error Handling Middleware
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app };
