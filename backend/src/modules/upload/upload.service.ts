import { cloudinary, UPLOAD_OPTIONS } from "../../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

export type ImageType = "avatar" | "book" | "banner";

export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export class UploadService {
    /**
     * Upload ảnh từ buffer (Multer memory storage)
     */
    async uploadImage(
        file: Express.Multer.File,
        type: ImageType
    ): Promise<UploadResult> {
        const options = UPLOAD_OPTIONS[type];

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: options.folder,
                    transformation: options.transformation,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(new Error(`Upload failed: ${error.message}`));
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes,
                        });
                    }
                }
            );

            // Stream buffer to Cloudinary
            uploadStream.end(file.buffer);
        });
    }

    /**
     * Upload ảnh từ URL (ví dụ: Google Avatar)
     */
    async uploadFromUrl(
        imageUrl: string,
        type: ImageType
    ): Promise<UploadResult> {
        const options = UPLOAD_OPTIONS[type];

        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: options.folder,
            transformation: options.transformation,
            resource_type: "image",
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    }

    /**
     * Xóa ảnh khỏi Cloudinary
     */
    async deleteImage(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === "ok";
        } catch (error) {
            console.error("Failed to delete image:", error);
            return false;
        }
    }

    /**
     * Xóa nhiều ảnh
     */
    async deleteImages(publicIds: string[]): Promise<void> {
        if (publicIds.length === 0) return;

        await cloudinary.api.delete_resources(publicIds);
    }

    /**
     * Tạo URL với transformation
     */
    getTransformedUrl(
        publicId: string,
        options: {
            width?: number;
            height?: number;
            crop?: string;
            quality?: string | number;
        }
    ): string {
        return cloudinary.url(publicId, {
            transformation: [
                {
                    width: options.width,
                    height: options.height,
                    crop: options.crop || "fill",
                    quality: options.quality || "auto",
                    fetch_format: "auto",
                },
            ],
            secure: true,
        });
    }

    /**
     * Lấy thumbnail URL
     */
    getThumbnailUrl(publicId: string, size: number = 150): string {
        return this.getTransformedUrl(publicId, {
            width: size,
            height: size,
            crop: "thumb",
        });
    }
}

export const uploadService = new UploadService();