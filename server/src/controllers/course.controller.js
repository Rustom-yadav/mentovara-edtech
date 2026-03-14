import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createCourse = asyncHandler(async (req, res) => {
    const { title, description, price, isPublished } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    let thumbnailLocalPath;
    if (req.file) {
        thumbnailLocalPath = req.file.path;
    }

    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const course = await Course.create({
        title,
        description,
        price: price || 0,
        thumbnail: thumbnail?.url || "",
        isPublished: isPublished || false,
        instructor: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

const getCourses = asyncHandler(async (req, res) => {
    // For now, return all published courses
    const courses = await Course.find({ isPublished: true }).populate("instructor", "fullName avatar");
    
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
    const { courseId } = req.params;
    const { title, description, price, isPublished } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this course");
    }

    let thumbnailLocalPath;
    if (req.file) {
        thumbnailLocalPath = req.file.path;
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail && thumbnail.url) {
            updateData.thumbnail = thumbnail.url;
        }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $set: updateData },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
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
