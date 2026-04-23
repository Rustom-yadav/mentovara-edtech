import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Safely insert DB_NAME before query parameters (like ?authSource=admin)
        const uri = process.env.MONGO_URI.includes("?")
            ? process.env.MONGO_URI.replace("?", `/${DB_NAME}?`)
            : `${process.env.MONGO_URI}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(uri);
        console.log(
            `MongoDB Connected! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB Connection FAILED:", error.message);
        process.exit(1);
    }
};

export default connectDB;
