import "dotenv/config";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Server Error:", error);
            throw error;
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed!", error);
    });
