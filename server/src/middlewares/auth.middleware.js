import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { USER_ROLES } from "../constants.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
});

// Middleware to check if user is an instructor
export const isInstructor = asyncHandler(async (req, _res, next) => {
    if (req.user?.role !== USER_ROLES.INSTRUCTOR) {
        throw new ApiError(403, "Access denied. Instructor role required.");
    }
    next();
});
