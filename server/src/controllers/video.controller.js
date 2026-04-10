import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/Video.model.js";
import Section from "../models/Section.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";


const addVideo = asyncHandler(async (req, res) => {
    const videoLocalPath = req.file?.path;
    let uploadedVideoPublicId; // Track for cleanup on failure

    try {
        const { title, description, section } = req.body;

        // 1. Validation
        if (!title || !section) {
            throw new ApiError(400, "Title and section ID are required");
        }
        
        const isValidSection = await Section.findById(section);

        if (!isValidSection) {
            throw new ApiError(404, "Section not found");
        }

        // 2. File check
        if (!videoLocalPath) {
            throw new ApiError(400, "Video file is required");
        }

        // 3. Cloudinary Upload (throws on failure)
        const videoUpload = await uploadOnCloudinary(videoLocalPath);

        uploadedVideoPublicId = videoUpload.public_id;

        // 4. Create Video
        const video = await Video.create({
            title,
            description: description || "",
            videoUrl: videoUpload.secure_url,
            publicId: videoUpload.public_id,
            duration: Math.round(videoUpload.duration || 0),
            section
        });

        // 5. Update Section
        await Section.findByIdAndUpdate(
            section,
            { $addToSet: { videos: video._id } },
            { new: true }
        );

        return res.status(201).json(
            new ApiResponse(201, video, "Video added successfully")
        );

    } catch (error) {
        // Clean up local file
        if (videoLocalPath && fs.existsSync(videoLocalPath)) {
            fs.unlinkSync(videoLocalPath);
        }
        // Clean up Cloudinary upload if it succeeded before the error
        if (uploadedVideoPublicId) {
            deleteFromCloudinary(uploadedVideoPublicId, "video").catch(() => {});
        }
        throw error;
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
