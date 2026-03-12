import mongoose, { Schema } from "mongoose";

const sectionSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Section title is required"],
            trim: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;
