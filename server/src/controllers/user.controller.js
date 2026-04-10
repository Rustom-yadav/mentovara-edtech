import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch {
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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const user = await User.create({
            fullName,
            avatar: avatar?.secure_url || "",
            avatarPublicId: avatar?.public_id || "",
            email,
            password,
            username: username,
            role: role || "student",
            emailVerificationOTP: otp,
            emailVerificationOTPExpiry: otpExpiry,
            isEmailVerified: false
        });

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        // Fire-and-forget: send email in background so registration response is instant
        // If email fails, user can request a new OTP from the verify-email page
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Mentovara!</h2>
                <p>Thank you for registering. Please use the following code to verify your email address:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 15 minutes.</p>
            </div>
        `;
        sendEmail({
            email: user.email,
            subject: "Verify Your Email Address - Mentovara",
            message,
        }).catch((error) => {
            console.error("Failed to send verification email:", error);
        });

        const createdUser = user.toObject();
        delete createdUser.password;
        delete createdUser.refreshToken;
        delete createdUser.emailVerificationOTP;
        delete createdUser.emailVerificationOTPExpiry;

        return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully. Please verify your email."));
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

    if (!user.isEmailVerified) {
        return res.status(403).json(
            new ApiResponse(403, { email: user.email, isEmailVerified: false }, "Please verify your email address before logging in.")
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
        sameSite: "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // Return the access token alongside user data so the frontend
    // can store it in Redux for direct backend requests (e.g., video uploads)
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    return res.status(200).json(
        new ApiResponse(200, { user: req.user, accessToken }, "Current user fetched successfully")
    );
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

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, null, "Email is already verified"));
    }

    if (user.emailVerificationOTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.emailVerificationOTPExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, null, "Email is already verified"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Mentovara!</h2>
                <p>Please use the following code to verify your email address:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 15 minutes.</p>
            </div>
        `;
        await sendEmail({
            email: user.email,
            subject: "Verify Your Email Address - Mentovara",
            message,
        });
    } catch (error) {
        console.error("Failed to resend verification email:", error);
        throw new ApiError(500, "Failed to send verification email. Please try again later.");
    }

    return res.status(200).json(new ApiResponse(200, null, "Verification email resent successfully"));
});

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getCurrentUser, 
    updateProfile,
    refreshAccessToken,
    verifyEmail,
    resendVerificationEmail
};
