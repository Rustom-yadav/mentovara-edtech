import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Video title is required"],
            trim: true,
        },
        videoUrl: {
            type: String, // Cloudinary URL
            required: [true, "Video URL is required"],
        },
        publicId: {
            type: String, // Cloudinary public ID (for deletion)
            required: true,
        },
        duration: {
            type: Number, // Duration in seconds
            default: 0,
        },
        description: {
            type: String,
            default: "",
        },
        section: {
            type: Schema.Types.ObjectId,
            ref: "Section",
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
