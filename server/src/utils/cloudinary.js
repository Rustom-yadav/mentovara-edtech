import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File uploaded successfully — remove local temp file
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // Remove the locally saved temp file if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary Upload Error:", error.message);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return response;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error.message);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
