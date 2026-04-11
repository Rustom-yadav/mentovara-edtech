import mongoose, { Schema } from "mongoose"

const paymentSchema = new Schema({
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: "Course",
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    razorpayOrderId: { 
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: { 
      type: String,
      index: true
    },
    amount: { 
      type: Number,
      required: true
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending"
    }
}, { timestamps: true }); 

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
