import "dotenv/config";
import http from "http";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

const PORT = parseInt(process.env.PORT, 10) || 8000;

console.log(`[BOOT] Starting Mentovara server...`);
console.log(`[BOOT] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[BOOT] PORT: ${PORT}`);

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Server Error:", error);
        });

        // Use http.createServer for reliable port binding on Render
        const server = http.createServer(app);

        server.listen(PORT, "0.0.0.0", () => {
            const addr = server.address();
            console.log(`[BOOT] Server listening on ${addr.address}:${addr.port}`);
            console.log(`[BOOT] Health check: http://localhost:${PORT}/api/v1/health`);
        });

        server.on("error", (err) => {
            console.error("[BOOT] Server listen error:", err);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed!", error);
        process.exit(1);
    });
