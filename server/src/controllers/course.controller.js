import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const createCourse = asyncHandler(async (req, res) => {
    let thumbnailLocalPath;
    if (req.file) {
        thumbnailLocalPath = req.file.path;
    }

    try {
        const { title, description, price, isPublished } = req.body;

        if (!title || !description) {
            throw new ApiError(400, "Title and description are required");
        }

        let thumbnail;
        if (thumbnailLocalPath) {
            thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
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
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath);
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

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json(new ApiResponse(200, {}, "Course deleted successfully"));
});

const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const user = await User.findById(req.user._id);

    if (user.enrolledCourses.includes(courseId)) {
        throw new ApiError(400, "You are already enrolled in this course");
    }

    user.enrolledCourses.push(courseId);
    await user.save({ validateBeforeSave: false });

    course.enrolledStudents += 1;
    await course.save();

    return res.status(200).json(new ApiResponse(200, {}, "Successfully enrolled in the course"));
});

export { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, enrollInCourse };
