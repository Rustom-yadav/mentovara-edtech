import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max file size
    },
});
