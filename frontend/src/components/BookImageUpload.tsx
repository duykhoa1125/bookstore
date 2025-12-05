import { useState, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { Loader2, ImageIcon, X, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface BookImageUploadProps {
  bookId?: string;
  currentImage?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUrlChange?: (url: string) => void;
  disabled?: boolean;
}

export function BookImageUpload({
  bookId,
  currentImage,
  onUploadSuccess,
  onUrlChange,
  disabled = false,
}: BookImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF)");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload
      try {
        setLoading(true);

        if (bookId) {
          // Upload và cập nhật book trực tiếp
          const response = await api.uploadBookImage(bookId, file);
          if (response.success && response.data) {
            toast.success("Ảnh sách đã được cập nhật!");
            onUploadSuccess?.(response.data.image.url);
            setPreview(null);
          }
        } else {
          // Upload và trả về URL (cho form tạo mới)
          const response = await api.uploadImage(file, "book");
          if (response.success && response.data) {
            toast.success("Tải ảnh thành công!");
            onUrlChange?.(response.data.url);
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải ảnh lên";
        toast.error(errorMessage);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    },
    [bookId, onUploadSuccess, onUrlChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input để có thể chọn lại cùng file
      e.target.value = "";
    },
    [handleFile]
  );

  const handleClearImage = useCallback(() => {
    setPreview(null);
    onUrlChange?.("");
  }, [onUrlChange]);

  const displayImage = preview || currentImage;

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
        dragActive
          ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
          : "border-gray-300 hover:border-gray-400 bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragLeave={!disabled ? handleDragLeave : undefined}
      onDrop={!disabled ? handleDrop : undefined}
    >
      {displayImage ? (
        <div className="relative p-4">
          <div className="relative aspect-[2/3] max-w-[200px] mx-auto overflow-hidden rounded-lg shadow-md">
            <img
              src={displayImage}
              alt="Book cover preview"
              className="w-full h-full object-cover"
            />

            {/* Remove button */}
            {!disabled && !loading && (
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                  <span className="text-white text-sm mt-2 block">
                    Đang tải...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Replace button */}
          {!disabled && !loading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 mx-auto flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Thay đổi ảnh
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={!disabled ? () => fileInputRef.current?.click() : undefined}
          className={`p-8 text-center ${!disabled ? "cursor-pointer" : ""}`}
        >
          {loading ? (
            <div className="py-4">
              <Loader2 className="w-12 h-12 mx-auto text-indigo-500 animate-spin" />
              <p className="mt-3 text-sm text-gray-600">Đang tải ảnh lên...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Kéo thả ảnh vào đây
              </p>
              <p className="text-sm text-gray-500 mb-3">hoặc</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <Upload className="w-4 h-4" />
                Chọn ảnh
              </span>
              <p className="mt-4 text-xs text-gray-400">
                PNG, JPG, WebP, GIF (tối đa 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || loading}
      />
    </div>
  );
}
