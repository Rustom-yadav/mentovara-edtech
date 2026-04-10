import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Section from "../models/Section.model.js";
import Course from "../models/Course.model.js";
import Video from "../models/Video.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const addSection = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const { courseId } = req.params;

    if (!title || !courseId) {
        throw new ApiError(400, "Title and Course ID are required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Verify instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add a section to this course");
    }

    const section = await Section.create({
        title,
        course: courseId
    });

    if (!section) {
        throw new ApiError(500, "Something went wrong while creating the section");
    }

    // Link section to course
    await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { sections: section._id } }
    );

    return res.status(201).json(new ApiResponse(201, section, "Section created successfully"));
});

const updateSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { title } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required for update");
    }

    const section = await Section.findById(sectionId).populate("course");

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    // Authorization check
    if (section.course.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this section");
    }

    section.title = title;
    await section.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, section, "Section updated successfully"));
});

const getCourseSections = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const sections = await Section.find({ course: courseId }).populate("videos");

    return res.status(200).json(new ApiResponse(200, sections, "Course sections fetched successfully"));
});

const deleteSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId).populate("course");

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    if (section.course.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this section");
    }

    const session = await mongoose.startSession();
    

    try {
        session.startTransaction();
        // Find all videos in the section to delete from Cloudinary
        const videos = await Video.find({ section: sectionId }).session(session);

        if (videos.length > 0) {
            const deleteVideoPromises = videos.map((video) => {
                if (video.publicId) {
                    return deleteFromCloudinary(video.publicId, "video");
                }
                return Promise.resolve();
            });

            await Promise.all(deleteVideoPromises);
            await Video.deleteMany({ section: sectionId }, { session });
        }

        // Unlink section from course
        await Course.findByIdAndUpdate(
            section.course._id,
            { $pull: { sections: sectionId } },
            { session }
        );

        // Delete the section document
        await Section.findByIdAndDelete(sectionId, { session });

        await session.commitTransaction();
    } catch {
        await session.abortTransaction();
        throw new ApiError(500, "Failed to delete section due to internal error");
    } finally {
        session.endSession();
    }

    return res.status(200).json(new ApiResponse(200, {}, "Section deleted successfully"));
});

export { addSection, updateSection, getCourseSections, deleteSection };
