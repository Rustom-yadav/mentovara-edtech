import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Course description is required"],
        },
        thumbnail: {
            type: String, // Cloudinary URL
            default: "",
        },
        price: {
            type: Number,
            default: 0,
            min: [0, "Price cannot be negative"],
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Section",
            },
        ],
        isPublished: {
            type: Boolean,
            default: false,
        },
        enrolledStudents: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
