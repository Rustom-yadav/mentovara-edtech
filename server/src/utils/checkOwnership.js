import { ApiError } from "./ApiError.js";

/**
 * Verify that the requesting user owns the resource.
 * Throws 403 if not authorized.
 *
 * @param {ObjectId|string} ownerId - The resource owner's ID (e.g., course.instructor)
 * @param {ObjectId|string} userId  - The requesting user's ID (req.user._id)
 * @param {string} [message]       - Optional custom error message
 */
export const checkOwnership = (ownerId, userId, message = "You are not authorized to perform this action") => {
    if (ownerId.toString() !== userId.toString()) {
        throw new ApiError(403, message);
    }
};
