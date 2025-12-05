import { Request, Response } from "express";
import { uploadService, ImageType } from "./upload.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UploadController {
    /**
     * Upload avatar cho user hiện tại
     */
    async uploadAvatar(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            const userId = req.user!.id;

            // Upload to Cloudinary
            const result = await uploadService.uploadImage(req.file, "avatar");

            // Lấy user hiện tại để xóa avatar cũ nếu có
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { avatar: true },
            });

            // Xóa avatar cũ trên Cloudinary (nếu là Cloudinary URL)
            if (currentUser?.avatar?.includes("cloudinary.com")) {
                const oldPublicId = this.extractPublicId(currentUser.avatar);
                if (oldPublicId) {
                    await uploadService.deleteImage(oldPublicId);
                }
            }

            // Cập nhật avatar mới trong database
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatar: result.url },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                    avatar: true,
                },
            });

            res.json({
                success: true,
                message: "Avatar uploaded successfully",
                data: {
                    user: updatedUser,
                    image: result,
                },
            });
        } catch (error: any) {
            console.error("Upload avatar error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to upload avatar",
            });
        }
    }

    /**
     * Upload ảnh cho sách
     */
    async uploadBookImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            const { bookId } = req.params;

            // Kiểm tra book tồn tại
            const book = await prisma.book.findUnique({
                where: { id: bookId },
                select: { id: true, imageUrl: true },
            });

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found",
                });
            }

            // Upload to Cloudinary
            const result = await uploadService.uploadImage(req.file, "book");

            // Xóa ảnh cũ trên Cloudinary
            if (book.imageUrl?.includes("cloudinary.com")) {
                const oldPublicId = this.extractPublicId(book.imageUrl);
                if (oldPublicId) {
                    await uploadService.deleteImage(oldPublicId);
                }
            }

            // Cập nhật imageUrl trong database
            const updatedBook = await prisma.book.update({
                where: { id: bookId },
                data: { imageUrl: result.url },
            });

            res.json({
                success: true,
                message: "Book image uploaded successfully",
                data: {
                    book: updatedBook,
                    image: result,
                },
            });
        } catch (error: any) {
            console.error("Upload book image error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to upload book image",
            });
        }
    }

    /**
     * Upload ảnh chung (trả về URL)
     */
    async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            const type = (req.query.type as ImageType) || "book";

            const result = await uploadService.uploadImage(req.file, type);

            res.json({
                success: true,
                message: "Image uploaded successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to upload image",
            });
        }
    }

    /**
     * Xóa ảnh
     */
    async deleteImage(req: Request, res: Response) {
        try {
            const { publicId } = req.body;

            if (!publicId) {
                return res.status(400).json({
                    success: false,
                    message: "Public ID is required",
                });
            }

            const success = await uploadService.deleteImage(publicId);

            res.json({
                success,
                message: success ? "Image deleted successfully" : "Failed to delete image",
            });
        } catch (error: any) {
            console.error("Delete image error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to delete image",
            });
        }
    }

    /**
     * Helper: Extract public_id from Cloudinary URL
     */
    private extractPublicId(url: string): string | null {
        try {
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
            const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
            const match = url.match(regex);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }
}

export const uploadController = new UploadController();