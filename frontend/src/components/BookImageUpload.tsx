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
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 group ${
        dragActive
          ? "border-blue-500 bg-blue-50/50 scale-[1.01] shadow-lg shadow-blue-500/10"
          : "border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-white"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragLeave={!disabled ? handleDragLeave : undefined}
      onDrop={!disabled ? handleDrop : undefined}
    >
      {displayImage ? (
        <div className="relative p-6">
          <div className="relative aspect-[2/3] max-w-[180px] mx-auto overflow-hidden rounded-xl shadow-lg ring-1 ring-gray-900/5 group-hover:scale-[1.02] transition-transform duration-300">
            <img
              src={displayImage}
              alt="Book cover preview"
              className="w-full h-full object-cover"
            />

            {/* Remove button */}
            {!disabled && !loading && (
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg ring-1 ring-gray-100">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  </div>
                  <span className="text-gray-900 text-xs font-bold mt-2 block tracking-wide uppercase">
                    Uploading...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Replace button */}
          {!disabled && !loading && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-200 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>Change Image</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={!disabled ? () => fileInputRef.current?.click() : undefined}
          className={`p-10 text-center ${!disabled ? "cursor-pointer" : ""}`}
        >
          {loading ? (
            <div className="py-4">
              <div className="bg-white p-4 rounded-full shadow-lg inline-block mb-3 ring-1 ring-gray-100">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Uploading image...</p>
            </div>
          ) : (
            <div className="group-hover:translate-y-[-2px] transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Drag & drop cover image
              </p>
              <p className="text-xs text-gray-500 mb-4 font-medium">or click to browse</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/10 group-hover:shadow-xl hover:-translate-y-0.5">
                <Upload className="w-4 h-4" />
                Select File
              </span>
              <p className="mt-6 text-[10px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-gray-500 transition-colors">
                PNG, JPG, WebP, GIF (Max 10MB)
              </p>
            </div>
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
