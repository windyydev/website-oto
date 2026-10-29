"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Newspaper, 
  PlusCircle, 
  Search, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Pencil,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { adminApi, Post } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { page_size: 50 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (publishedFilter !== "") params.is_published = publishedFilter === "true";

      const res = await adminApi.getAdminPosts(params);
      setPosts(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      await adminApi.updatePost(post.id, { is_published: !post.is_published });
      fetchPosts();
    } catch (err: any) {
      alert("Lỗi khi cập nhật trạng thái: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeletePost = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      await adminApi.deletePost(id);
      fetchPosts();
    } catch (err: any) {
      alert("Lỗi khi xóa bài viết: " + (err.response?.data?.detail || err.message));
    }
  };

  const publishedCount = posts.filter((p) => p.is_published).length;
  const draftCount = posts.filter((p) => !p.is_published).length;
  const categoriesList = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <AdminPageHeader
        breadcrumbs={{ category: "BẢNG ĐIỀU KHIỂN", subCategory: "TẠP CHÍ & BÀI VIẾT" }}
        title="Quản Lý Tin Tức & Tạp Chí Atelier"
        description={`Hiện có tổng cộng ${total} bài viết chuyên gia trong hệ thống editorial.`}
        actions={
          <Link
            href="/admin/posts/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs transition shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Viết Bài Viết Mới</span>
          </Link>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
              Tổng số bài viết
            </span>
            <span className="text-2xl font-display font-bold text-[var(--text-primary)] mt-1 block">
              {total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
              Đã xuất bản (Live)
            </span>
            <span className="text-2xl font-display font-bold text-emerald-500 mt-1 block">
              {publishedCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
              Bản nháp (Drafts)
            </span>
            <span className="text-2xl font-display font-bold text-amber-500 mt-1 block">
              {draftCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl flex flex-col md:flex-row gap-3 items-center shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
          >
            <option value="">Tất cả chuyên mục</option>
            {categoriesList.map((cat) => (
              <option key={cat as string} value={cat as string}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Published Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đã xuất bản</option>
            <option value="false">Bản nháp</option>
          </select>
        </div>

        {/* Submit Filter Button */}
        <button
          onClick={fetchPosts}
          className="w-full md:w-auto px-4 py-2 bg-[var(--surface-mid)] hover:bg-[var(--surface-high)] text-[var(--text-primary)] rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 shrink-0 border border-[var(--border-subtle)] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Lọc dữ liệu</span>
        </button>
      </div>

      {/* Posts Table */}
      <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs text-[var(--text-secondary)] mt-2 block">
              Đang tải danh sách bài viết...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <AdminEmptyState
            icon={FileText}
            title="Không tìm thấy bài viết nào"
            description="Chưa có bài viết phù hợp với bộ lọc hiện tại hoặc kho editorial đang trống."
            actions={
              <Link
                href="/admin/posts/create"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-[var(--text-inverted)] text-xs font-semibold hover:opacity-90 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Viết Bài Viết Mới</span>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-low)] text-[var(--text-muted)] font-medium">
                  <th className="py-3 px-4 w-16">Ảnh</th>
                  <th className="py-3 px-4 min-w-[260px]">Tiêu đề bài viết</th>
                  <th className="py-3 px-4 w-36">Chuyên mục</th>
                  <th className="py-3 px-4 w-32">Ngày xuất bản</th>
                  <th className="py-3 px-4 w-28">Trạng thái</th>
                  <th className="py-3 px-4 w-36 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--surface-low)]/50 transition">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-14 h-10 rounded-md overflow-hidden bg-[var(--surface-mid)] border border-[var(--border-subtle)] shrink-0">
                        {post.cover_url ? (
                          <img
                            src={post.cover_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <Newspaper className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition block line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate max-w-md">
                          /tin-tuc/{post.slug}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] border border-[var(--brand-gold)]/20">
                        {post.category || "Tin tức"}
                      </span>
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        title="Bấm để bật/tắt trạng thái xuất bản"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                          post.is_published
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{post.is_published ? "Đã đăng" : "Bản nháp"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Public */}
                        <Link
                          href={`/tin-tuc/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                          title="Xem trên website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition"
                          title="Chỉnh sửa bài viết"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
