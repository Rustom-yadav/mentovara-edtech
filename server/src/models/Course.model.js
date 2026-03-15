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
        thumbnailPublicId: {
            type: String, // Cloudinary public ID
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

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Course = mongoose.model("Course", courseSchema);
courseSchema.plugin(mongooseAggregatePaginate);

export default Course;
