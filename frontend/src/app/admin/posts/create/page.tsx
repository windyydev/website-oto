"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadCloud, 
  X, 
  Check, 
  Sparkles, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Eye,
  Edit3
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const DEFAULT_CATEGORIES = [
  "Đánh giá xe",
  "Tin thị trường",
  "Tư vấn & Pháp lý",
  "Sự kiện Atelier",
  "Bộ sưu tập đặc biệt",
  "Văn hóa xe sang"
];

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Đánh giá xe");
  const [customCategory, setCustomCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Cover image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.");
      return;
    }

    try {
      setSubmitting(true);
      let finalCoverUrl = coverUrl;

      // 1. Upload ảnh lên Cloudinary nếu người dùng chọn file
      if (uploadMode === "file" && selectedFile) {
        setUploadStatus("Đang tải ảnh bìa lên Cloudinary...");
        const uploadRes = await adminApi.uploadGeneralImage(selectedFile, "articles");
        finalCoverUrl = uploadRes.url;
      }

      setUploadStatus("Đang lưu bài viết vào hệ thống...");

      // 2. Tạo bài viết
      const finalCategory = category === "custom" ? customCategory : category;

      await adminApi.createPost({
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        cover_url: finalCoverUrl.trim() || undefined,
        category: finalCategory || "Tin tức",
        is_published: isPublished,
      });

      // Redirect về danh sách
      router.push("/admin/posts");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Đã xảy ra lỗi khi tạo bài viết.");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <AdminPageHeader
        breadcrumbs={{ category: "TẠP CHÍ & BÀI VIẾT", subCategory: "TẠO BÀI VIẾT" }}
        title="Soạn Thảo Bài Viết Mới"
        description="Đăng tải tin tức, phân tích chuyên môn hoặc đánh giá xe trên chuyên trang Atelier Magazine."
        actions={
          <Link
            href="/admin/posts"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Box */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-5 shadow-xs">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--brand-gold)]" />
            <span>Thông Tin Bài Viết</span>
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trải nghiệm thực tế Porsche 911 Carrera S: Sự hòa quyện giữa di sản và công nghệ"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition font-medium"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Đường dẫn tĩnh (Slug URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-[var(--surface-mid)] border border-r-0 border-[var(--border-subtle)] rounded-l-lg text-[11px] text-[var(--text-muted)] font-mono">
                  /tin-tuc/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-r-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition font-mono"
                />
              </div>
            </div>

            {/* Category & Excerpt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Chuyên mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Nhập chuyên mục khác</option>
                </select>
                {category === "custom" && (
                  <input
                    type="text"
                    placeholder="Nhập tên chuyên mục mới..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Trạng thái xuất bản
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--brand-gold)]"
                    />
                    <span className="text-[var(--text-primary)]">
                      {isPublished ? "Công khai lên website ngay" : "Lưu dưới dạng Bản nháp (Draft)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Tóm tắt ngắn (Excerpt)
              </label>
              <textarea
                rows={2}
                placeholder="Đoạn mở đầu ngắn gọn giới thiệu nội dung bài viết (hiển thị trên thẻ bài viết và meta SEO)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>
          </div>
        </div>

        {/* Cover Image Box */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[var(--brand-gold)]" />
              <span>Ảnh Bìa Bài Viết (Cover Image)</span>
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  uploadMode === "file"
                    ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-mid)]"
                }`}
              >
                Tải ảnh lên
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  uploadMode === "url"
                    ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-mid)]"
                }`}
              >
                Nhập URL
              </button>
            </div>
          </div>

          {uploadMode === "file" ? (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand-gold)] rounded-xl p-6 text-center cursor-pointer transition bg-[var(--surface-low)] hover:bg-[var(--surface-low)]/80"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-[var(--brand-gold)] mb-2" />
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  Click để chọn ảnh bìa bài viết
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Định dạng PNG, JPG, WEBP chất lượng cao (Tỷ lệ khuyến nghị 16:9 hoặc 16:10)
                </p>
              </div>

              {previewUrl && (
                <div className="relative aspect-[16/9] max-w-md rounded-xl overflow-hidden border border-[var(--border-subtle)] group">
                  <img src={previewUrl} alt="Preview cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition font-mono"
              />
              {coverUrl && (
                <div className="aspect-[16/9] max-w-md rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                  <img src={coverUrl} alt="Preview cover" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Box with Markdown & Preview Tabs */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[var(--brand-gold)]" />
              <span>Nội Dung Chi Tiết Bài Viết</span>
            </h2>

            <div className="flex items-center gap-1 bg-[var(--surface-low)] p-1 rounded-lg border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === "write"
                    ? "bg-[var(--surface-base)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Soạn thảo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-[var(--surface-base)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước</span>
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <div className="space-y-2">
              <textarea
                required
                rows={16}
                placeholder="Nhập nội dung bài viết tại đây. Hỗ trợ định dạng văn bản nhiều đoạn, tiêu đề phụ và trích dẫn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] leading-relaxed focus:outline-none focus:border-[var(--brand-gold)] font-sans"
              />
              <span className="text-[11px] text-[var(--text-muted)] block">
                Mẹo: Bạn có thể ngắt các đoạn văn bản rõ ràng để bài viết hiển thị sang trọng theo phong cách Atelier Editorial.
              </span>
            </div>
          ) : (
            <div className="p-6 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-xl min-h-[300px] text-xs text-[var(--text-secondary)] leading-relaxed space-y-4">
              {content ? (
                content.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line font-light">
                    {paragraph}
                  </p>
                ))
              ) : (
                <span className="text-[var(--text-muted)] italic">
                  Chưa có nội dung để xem trước...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/posts"
            className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-low)] transition"
          >
            Hủy bỏ
          </Link>

          <div className="flex items-center gap-3">
            {uploadStatus && (
              <span className="text-xs text-[var(--brand-gold)] animate-pulse">
                {uploadStatus}
              </span>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Đang xử lý..." : isPublished ? "Lưu & Xuất Bản" : "Lưu Bản Nháp"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
