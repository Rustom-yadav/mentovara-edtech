import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import Section from "../models/Section.model.js";
import Video from "../models/Video.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const createCourse = asyncHandler(async (req, res) => {
    let thumbnailLocalPath;
    if (req.file) {
        thumbnailLocalPath = req.file.path;
    }

    let uploadedThumbnailPublicId; // Track for cleanup on failure

    try {
        const { title, description, price, isPublished } = req.body;

        if (!title || !description) {
            throw new ApiError(400, "Title and description are required");
        }

        let thumbnail;
        if (thumbnailLocalPath) {
            thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            uploadedThumbnailPublicId = thumbnail?.public_id;
        }

        const course = await Course.create({
            title,
            description,
            price: price || 0,
            thumbnail: thumbnail?.secure_url || "",
            thumbnailPublicId: thumbnail?.public_id || "",
            isPublished: isPublished || false,
            instructor: req.user._id
        });

        return res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
    } catch (error) {
        // Clean up local temp file
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath);
        }
        // Clean up Cloudinary upload if it succeeded before the error
        if (uploadedThumbnailPublicId) {
            deleteFromCloudinary(uploadedThumbnailPublicId).catch(() => {});
        }
        throw error;
    }
});

const getCourses = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query } = req.query;

    const pipeline = [];

    // Filter by query (title or description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // Only get published courses unless specified otherwise (for admin/instructor maybe later)
    pipeline.push({
        $match: {
            isPublished: true
        }
    });

    // Default sorting (newest first)
    pipeline.push({
        $sort: {
            createdAt: -1
        }
    });

    // Lookup to get instructor info since populate doesn't work directly with aggregatePaginate easily in simple way
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "instructor",
                foreignField: "_id",
                as: "instructor",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                instructor: {
                    $first: "$instructor"
                }
            }
        }
    );

    const options = {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, Math.min(100, parseInt(limit, 10) || 10))
    };

    const courses = await Course.aggregatePaginate(Course.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
});

const getCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("instructor", "fullName avatar").populate("sections");

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res.status(200).json(new ApiResponse(200, course, "Course fetched successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
    let thumbnailLocalPath;
    if (req.file) {
        thumbnailLocalPath = req.file.path;
    }

    try {
        const { courseId } = req.params;
        const { title, description, price, isPublished } = req.body;

        const course = await Course.findById(courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this course");
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (isPublished !== undefined) updateData.isPublished = isPublished;

        if (thumbnailLocalPath) {
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            if (thumbnail && thumbnail.secure_url) {
                if (course.thumbnailPublicId) {
                    await deleteFromCloudinary(course.thumbnailPublicId);
                }
                updateData.thumbnail = thumbnail.secure_url;
                updateData.thumbnailPublicId = thumbnail.public_id;
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedCourse) {
            throw new ApiError(500, "Something went wrong while updating the course");
        }

        return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
    } catch (error) {
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath);
        }
        throw error;
    }
});

const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this course");
    }

    if (course.thumbnailPublicId) {
        await deleteFromCloudinary(course.thumbnailPublicId);
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Cascade delete: Find all sections of this course
        const sections = await Section.find({ course: courseId }).session(session);

        if (sections.length > 0) {
            const sectionIds = sections.map((sec) => sec._id);

            // Find all videos associated with these sections
            const videos = await Video.find({ section: { $in: sectionIds } }).session(session);

            if (videos.length > 0) {
                // Delete all videos from Cloudinary concurrently
                const deleteVideoPromises = videos.map((video) => {
                    if (video.publicId) {
                        return deleteFromCloudinary(video.publicId, "video");
                    }
                    return Promise.resolve();
                });

                await Promise.all(deleteVideoPromises);

                // Delete video documents from DB using session
                await Video.deleteMany({ section: { $in: sectionIds } }, { session });
            }

            // Delete section documents from DB using session
            await Section.deleteMany({ course: courseId }, { session });
        }

        // Output course using session
        await Course.findByIdAndDelete(courseId, { session });

        await session.commitTransaction();
    } catch {
        await session.abortTransaction();
        throw new ApiError(500, "Failed to delete course due to an internal transaction error");
    } finally {
        session.endSession();
    }

    return res.status(200).json(new ApiResponse(200, {}, "Course deleted successfully"));
});

const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const updatedUser = await User.findOneAndUpdate(
        {
            _id: req.user._id,
            enrolledCourses: { $ne: courseId }
        },
        {
            $addToSet: { enrolledCourses: courseId }
        },
        { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(400, "You are already enrolled in this course");
    }

    await Course.findByIdAndUpdate(
        courseId,
        {
            $inc: { enrolledStudents: 1 }
        }
    );

    return res.status(200).json(new ApiResponse(200, {}, "Successfully enrolled in the course"));
});

export { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, enrollInCourse };
