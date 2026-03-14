import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/Video.model.js";
import Section from "../models/Section.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { isValidObjectId } from "mongoose";

const addVideo = asyncHandler(async (req, res) => {
    const { title, description, section } = req.body;

    // 1. Validation improvements
    if (!title || !section) {
        throw new ApiError(400, "Title and section ID are required");
    }

    if (!isValidObjectId(section)) {
        throw new ApiError(400, "Invalid Section ID format");
    }

    // 2. File check
    const videoLocalPath = req.file?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    try {
        // 3. Cloudinary Upload
        const videoUpload = await uploadOnCloudinary(videoLocalPath);

        if (!videoUpload) {
            throw new ApiError(500, "Failed to upload video to Cloudinary");
        }

        // 4. Create Video
        const video = await Video.create({
            title,
            description: description || "",
            videoUrl: videoUpload.url,
            publicId: videoUpload.public_id,
            duration: Math.round(videoUpload.duration || 0),
            section
        });

        // 5. Update Section (Directly push and check)
        const updatedSection = await Section.findByIdAndUpdate(
            section,
            { $push: { videos: video._id } },
            { new: true }
        );

        if (!updatedSection) {
            // Agar section nahi mila toh video delete karna pad sakta hai (optional advanced step)
            throw new ApiError(404, "Section not found, video could not be linked");
        }

        // 6. Cleanup: Remove local file after success
        if (fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath);

        return res.status(201).json(
            new ApiResponse(201, video, "Video added successfully")
        );

    } catch (error) {
        // 7. Critical: Cleanup local file even if something fails
        if (fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath);
        throw new ApiError(500, error?.message || "Internal Server Error during video upload");
    }
});


const getVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Attempt to delete from Cloudinary
    if (video.publicId) {
        await deleteFromCloudinary(video.publicId, "video");
    }

    // Remove video reference from section
    await Section.findByIdAndUpdate(video.section, {
        $pull: { videos: videoId }
    });

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export { addVideo, getVideo, deleteVideo };
