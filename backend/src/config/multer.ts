import multer from "multer";
import path from "path";

// Sử dụng memory storage - không lưu file vào disk
const storage = multer.memoryStorage();

// File filter - chỉ chấp nhận ảnh
const imageFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Only image files are allowed (JPEG, PNG, WebP, GIF)"));
    }
};

// Export các multer instances
export const uploadAvatar = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const uploadBookImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

export const uploadBanner = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

// Generic upload
export const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});