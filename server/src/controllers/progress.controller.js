import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Progress from "../models/Progress.model.js";

const getProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        throw new ApiError(400, "Course ID is required");
    }

    let progress = await Progress.findOne({
        user: req.user._id,
        course: courseId
    });

    if (!progress) {
        // If no progress exists, return an empty progress object
        progress = {
            user: req.user._id,
            course: courseId,
            completedVideos: []
        };
    }

    return res.status(200).json(new ApiResponse(200, progress, "Progress fetched successfully"));
});

const markVideoComplete = asyncHandler(async (req, res) => {
    const { courseId, videoId } = req.body;

    if (!courseId || !videoId) {
        throw new ApiError(400, "Course ID and Video ID are required");
    }

    const progress = await Progress.findOneAndUpdate(
        {
            user: req.user._id,
            course: courseId
        },
        {
            $addToSet: { completedVideos: videoId }
        },
        { new: true, upsert: true } // Upsert handles creating it if it doesn't exist
    );

    return res.status(200).json(new ApiResponse(200, progress, "Video marked as complete"));
});

export { getProgress, markVideoComplete };
