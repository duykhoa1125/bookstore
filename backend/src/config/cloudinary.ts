import { v2 as cloudinary } from "cloudinary";

// Kiểm tra environment variables
const requiredEnvVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`Warning: ${envVar} is not defined`);
    }
}

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Luôn sử dụng HTTPS
});

export { cloudinary };

// Upload options mặc định
export const UPLOAD_OPTIONS = {
    avatar: {
        folder: "bookstore/avatars",
        transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
        ],
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        max_bytes: 5 * 1024 * 1024, // 5MB
    },
    book: {
        folder: "bookstore/books",
        transformation: [
            { width: 400, height: 600, crop: "fill" },
            { quality: "auto", fetch_format: "auto" },
        ],
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        max_bytes: 10 * 1024 * 1024, // 10MB
    },
    banner: {
        folder: "bookstore/banners",
        transformation: [
            { width: 1200, height: 400, crop: "fill" },
            { quality: "auto", fetch_format: "auto" },
        ],
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        max_bytes: 10 * 1024 * 1024, // 10MB
    },
};