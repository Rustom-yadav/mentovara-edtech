import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, _req, res, _next) => {
    let error = err;

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
