import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    createRazorpayOrder,
    verifyRazorpaySignature,
    verifyWebhookSignature,
} from "../utils/razorpay.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import Payment from "../models/Payment.model.js";
import mongoose from "mongoose";

/**
 * PRIVATE HELPER: Handles the actual enrollment logic
 * This is called by both verifyPayment and razorpayWebhook to ensure enrollment happens
 */
const fulfillEnrollment = async (userId, courseId, orderId, paymentId) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // 1. Safely acquire lock and update Payment status ONLY if it's currently 'pending'.
        // This acts as a robust concurrency check against double-webhook or frontend race conditions.
        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId: orderId, status: "pending" },
            {
                status: "completed",
                razorpayPaymentId: paymentId,
            },
            { new: true, session }
        );

        if (!payment) {
            // Payment doesn't exist, or was ALREADY processed. Safe to return early!
            console.log(`Enrollment already fulfilled or payment missing for order ${orderId}`);
            await session.commitTransaction();
            return;
        }

        // 3. Add course to user's enrolledCourses and payment record to user's history
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { 
                    enrolledCourses: courseId,
                    payments: payment._id 
                },
            },
            { session }
        );

        // 4. Increment enrolledStudents count in Course
        await Course.findByIdAndUpdate(
            courseId,
            { $inc: { enrolledStudents: 1 } },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error("Enrollment Fulfillment Error:", error);
        throw error; // Let the caller handle it
    } finally {
        session.endSession();
    }
};

/**
 * Initiates the payment by creating a Razorpay order
 * POST /api/v1/payments/initiate
 */
export const initiatePayment = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    if (!courseId) {
        throw new ApiError(400, "Course ID is required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Prevent Razorpay API crash if course is free
    if (course.price === 0 || !course.price) {
        throw new ApiError(400, "This is a free course. Please use the direct enrollment endpoint.");
    }

    // Check if already enrolled
    if (req.user.enrolledCourses.includes(courseId)) {
        throw new ApiError(400, "You are already enrolled in this course");
    }

    const amount = course.price * 100;
    const currency = "INR";
    const receipt = `receipt_${Date.now()}_${req.user._id.toString().slice(-5)}`;

    // Pass userId and courseId in notes for webhook fulfillment
    const notes = {
        userId: req.user._id.toString(),
        courseId: courseId.toString(),
    };

    const order = await createRazorpayOrder(amount, currency, receipt, notes);

    // Create a pending payment record
    await Payment.create({
        courseId,
        studentId: req.user._id,
        razorpayOrderId: order.id,
        amount: course.price,
        status: "pending",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Payment initiated successfully"));
});

/**
 * Verifies the payment signature (Client-side trigger)
 * POST /api/v1/payments/verify
 */
export const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
        throw new ApiError(400, "Missing required payment details");
    }

    const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValid) {
        await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: "failed" }
        );
        throw new ApiError(400, "Invalid payment signature");
    }

    // Call fulfillment helper
    await fulfillEnrollment(req.user._id, courseId, razorpay_order_id, razorpay_payment_id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Course enrolled successfully"));
});

/**
 * Handles Razorpay Webhook notifications (Server-side trigger)
 * POST /api/v1/payments/webhook
 */
export const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature || !req.rawBody) {
        throw new ApiError(400, "Missing webhook signature or raw body");
    }

    const isValid = verifyWebhookSignature(req.rawBody, signature);

    if (!isValid) {
        throw new ApiError(400, "Invalid webhook signature");
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
        const paymentEntity = payload.payment.entity;
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        
        // Extract IDs from notes
        const userId = paymentEntity.notes.userId;
        const courseId = paymentEntity.notes.courseId;

        if (userId && courseId) {
            const isAlreadyCompleted = await Payment.findOne({ 
                razorpayPaymentId: paymentId, 
                status: "completed" 
            });

            if (isAlreadyCompleted) {
                return res.status(200).json({ status: "ok" });
            }

            try {
                await fulfillEnrollment(userId, courseId, orderId, paymentId);
                console.log(`Webhook: Successfully fulfilled enrollment for user ${userId} in course ${courseId}`);
            } catch (error) {
                console.error("Webhook Fulfillment Failed:", error);
                // CRITICAL FIX: We must return 5xx to tell Razorpay to retry the webhook later
                // if the DB goes down. Returning 200 would prevent retries permanently.
                return res.status(500).json({ status: "error", message: "Fulfillment failed, triggering retry" });
            }
        } else {
            console.error("Webhook: Missing userId or courseId in notes");
        }
    }

    res.status(200).json({ status: "ok" });
});
