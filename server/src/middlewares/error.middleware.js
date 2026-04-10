import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, _req, res, _next) => {
    // Always log the full error on the server for debugging
    console.error("❌ [Error Handler]", err.message);
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }

    let error = err;

    // Handle Multer file-size errors with a clear message
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            error = new ApiError(413, "File too large. Maximum allowed size is 500 MB.");
        } else {
            error = new ApiError(400, `Upload error: ${err.message}`);
        }
    }

    // If the error is not an instance of ApiError, wrap it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
        }),
        errors: error.errors,
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
