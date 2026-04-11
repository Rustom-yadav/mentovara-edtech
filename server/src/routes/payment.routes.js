import { Router } from "express";
import {
    initiatePayment,
    verifyPayment,
    razorpayWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes for initiating and verifying payments (JWT protected)
router.post("/initiate", verifyJWT, initiatePayment);
router.post("/verify", verifyJWT, verifyPayment);

// Webhook for Razorpay (No JWT, signature verified internally)
router.post("/webhook", razorpayWebhook);

export default router;
