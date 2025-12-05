import { Router } from "express";
import { uploadController } from "./upload.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { uploadAvatar, uploadBookImage, upload } from "../../config/multer";

const router = Router();

// Tất cả routes cần authentication
router.use(AuthMiddleware.authenticate);

// Upload avatar cho user hiện tại
router.post(
    "/avatar",
    uploadAvatar.single("avatar"),
    uploadController.uploadAvatar.bind(uploadController)
);

// Upload ảnh sách (Admin only)
router.post(
    "/book/:bookId",
    AuthMiddleware.authorize("ADMIN"),
    uploadBookImage.single("image"),
    uploadController.uploadBookImage.bind(uploadController)
);

// Upload ảnh chung (Admin only)
router.post(
    "/image",
    AuthMiddleware.authorize("ADMIN"),
    upload.single("image"),
    uploadController.uploadImage.bind(uploadController)
);

// Xóa ảnh (Admin only)
router.delete(
    "/image",
    AuthMiddleware.authorize("ADMIN"),
    uploadController.deleteImage.bind(uploadController)
);

export default router;