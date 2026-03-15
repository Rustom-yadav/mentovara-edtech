import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    try {
        const { fullName, email, username, password, role } = req.body;

        if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        let avatar;
        if (avatarLocalPath) {
            avatar = await uploadOnCloudinary(avatarLocalPath);
        }

        const user = await User.create({
            fullName,
            avatar: avatar?.secure_url || "",
            avatarPublicId: avatar?.public_id || "",
            email,
            password,
            username: username,
            role: role || "student"
        });

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        const createdUser = user.toObject();
        delete createdUser.password;
        delete createdUser.refreshToken;

        return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
    } catch (error) {
        if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
            fs.unlinkSync(avatarLocalPath);
        }
        throw error;
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    let avatarLocalPath;

    if (req.file) {
        avatarLocalPath = req.file.path;
    }

    try {
        const { fullName } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;

        if (avatarLocalPath) {
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            if (avatar && avatar.secure_url) {
                const oldUser = await User.findById(req.user._id);
                if (oldUser && oldUser.avatarPublicId) {
                    await deleteFromCloudinary(oldUser.avatarPublicId);
                }
                updateData.avatar = avatar.secure_url;
                updateData.avatarPublicId = avatar.public_id;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: updateData
            },
            { new: true }
        );

        if (!user) {
            throw new ApiError(500, "Something went wrong while updating the profile");
        }

        return res.status(200).json(new ApiResponse(200, user, "Profile details updated successfully"));
    } catch (error) {
        if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
            fs.unlinkSync(avatarLocalPath);
        }
        throw error;
    }
});

export { registerUser, loginUser, logoutUser, getCurrentUser, updateProfile };
