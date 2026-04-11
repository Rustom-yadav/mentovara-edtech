import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "./ApiError.js";

// Initialize Razorpay instance
// Ensure these environment variables are defined in your .env file
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order
 * @param {number} amount - Amount in the smallest currency unit (e.g., paise for INR)
 * @param {string} currency - Currency code (default: "INR")
 * @param {string} receipt - Unique receipt identifier
 * @param {Object} notes - Optional metadata notes
 * @returns {Promise<Object>} - The created order object
 */
export const createRazorpayOrder = async (amount, currency = "INR", receipt, notes = {}) => {
    try {
        const options = {
            amount: Math.round(amount), // Ensure it's an integer
            currency,
            receipt,
            notes,
        };

        const order = await razorpayInstance.orders.create(options);

        if (!order) {
            throw new ApiError(500, "Failed to create Razorpay order");
        }

        return order;
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error occurred while creating Razorpay order"
        );
    }
};

/**
 * Verifies the Razorpay payment signature for client-side success response
 * @param {string} orderId - The Razorpay order ID
 * @param {string} paymentId - The Razorpay payment ID
 * @param {string} signature - The signature provided by Razorpay
 * @returns {boolean} - True if signature is valid
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        return expectedSignature === signature;
    } catch (error) {
        console.error("Signature Verification Error:", error);
        return false;
    }
};

/**
 * Verifies Razorpay Webhook signature
 * @param {string} rawBody - The raw, unparsed request body string
 * @param {string} signature - The X-Razorpay-Signature header
 * @returns {boolean} - True if webhook signature is valid
 */
export const verifyWebhookSignature = (rawBody, signature) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        // Manual crypto check using exactly the raw bytes received from Razorpay
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        return expectedSignature === signature;
    } catch (error) {
        console.error("Webhook Verification Error:", error);
        return false;
    }
};
