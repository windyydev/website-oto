"use client";

import { useEffect, useState } from "react";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Pencil, 
  ChevronRight, 
  ChevronDown, 
  FolderPlus, 
  AlertCircle, 
  Check, 
  CarFront,
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";
import { adminApi, Category } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [level, setLevel] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [description, setDescription] = useState("");

  // Tree collapsed state
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [treeData, flatData] = await Promise.all([
        adminApi.getCategoryTree(),
        adminApi.getCategories(),
      ]);

      setTree(treeData || []);
      setFlatCategories(flatData || []);

      // Auto expand top level
      const initialExpanded: Record<number, boolean> = {};
      (treeData || []).forEach((c) => {
        initialExpanded[c.id] = true;
      });
      setExpandedNodes(initialExpanded);
    } catch (err: any) {
      console.error(err);
      setError("Không thể nạp cây danh mục xe từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(slugify(val));
    }
  };

  const handleParentChange = (val: string) => {
    if (!val) {
      setParentId("");
      setLevel(1);
    } else {
      const pId = Number(val);
      setParentId(pId);
      const parentCat = flatCategories.find((c) => c.id === pId);
      setLevel(parentCat ? parentCat.level + 1 : 2);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setParentId("");
    setLevel(1);
    setSortOrder(0);
    setDescription("");
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id || "");
    setLevel(cat.level || 1);
    setSortOrder(cat.sort_order || 0);
    setDescription(cat.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartAddChild = (parentCat: Category) => {
    setEditingId(null);
    setName("");
    setSlug("");
    setParentId(parentCat.id);
    setLevel(parentCat.level + 1);
    setSortOrder(0);
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload: Partial<Category> = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        parent_id: parentId === "" ? null : Number(parentId),
        level,
        sort_order: Number(sortOrder) || 0,
        description: description.trim() || undefined,
      };

      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
        setSuccess(`Cập nhật danh mục "${name}" thành công!`);
      } else {
        await adminApi.createCategory(payload);
        setSuccess(`Thêm mới danh mục "${name}" thành công!`);
      }

      resetForm();
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Đã xảy ra lỗi khi lưu danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.children && cat.children.length > 0) {
      alert(`Danh mục "${cat.name}" đang chứa ${cat.children.length} danh mục con. Vui lòng chuyển hoặc xóa danh mục con trước.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      return;
    }

    try {
      await adminApi.deleteCategory(cat.id);
      fetchData();
    } catch (err: any) {
      alert("Lỗi khi xóa danh mục: " + (err.response?.data?.detail || err.message));
    }
  };

  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Render Category Node Recursive
  const renderCategoryNode = (cat: Category, depth: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = !!expandedNodes[cat.id];

    return (
      <div key={cat.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-3 rounded-lg border transition ${
            editingId === cat.id
              ? "bg-[var(--brand-gold)]/10 border-[var(--brand-gold)] ring-1 ring-[var(--brand-gold)]"
              : "bg-[var(--surface-base)] border-[var(--border-subtle)] hover:border-[var(--brand-gold)]/50"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(cat.id)}
                className="p-1 rounded hover:bg-[var(--surface-mid)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--brand-gold)]" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-low)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono">
                  {cat.slug}
                </span>
                {cat.cars_count !== undefined && cat.cars_count > 0 && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] font-semibold">
                    <CarFront className="w-3 h-3" />
                    <span>{cat.cars_count} xe</span>
                  </span>
                )}
              </div>
              {cat.description && (
                <p className="text-[11px] text-[var(--text-muted)] truncate max-w-sm font-light mt-0.5">
                  {cat.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              onClick={() => handleStartAddChild(cat)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition text-xs flex items-center gap-1"
              title="Thêm danh mục con"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Thêm con</span>
            </button>

            <button
              onClick={() => handleStartEdit(cat)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition"
              title="Chỉnh sửa danh mục"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDelete(cat)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition"
              title="Xóa danh mục"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {cat.children!.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={{ category: "BẢNG ĐIỀU KHIỂN", subCategory: "CÂY PHÂN CẤP DANH MỤC" }}
        title="Quản Lý Phân Cấp Danh Mục Xe"
        description="Thiết lập cấu trúc danh mục đa tầng (Phân khúc -> Nhóm xe -> Dòng xe) phục vụ bộ lọc tìm kiếm và phân loại kho xe Atelier."
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Tải lại cây</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Add / Edit Category */}
        <div className="p-5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-4 h-fit shadow-xs sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--brand-gold)]" />
              <span>{editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}</span>
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy sửa</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Coupe Thể Thao, Sedan Siêu Sang..."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition font-medium"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Slug danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition font-mono"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Danh mục cha (Trực thuộc)
              </label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              >
                <option value="">-- Là Danh mục gốc (Cấp 1) --</option>
                {flatCategories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {"— ".repeat((c.level || 1) - 1)} {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Level & Sort Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Cấp độ (Level)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Mô tả đặc trưng
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả phong cách, đối tượng hoặc phân khúc dòng xe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Đang lưu..." : editingId ? "Cập Nhật Danh Mục" : "Thêm Danh Mục"}</span>
            </button>
          </form>
        </div>

        {/* Right Tree: Interactive Category Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Sơ Đồ Cây Phân Cấp Hiện Tại
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Tổng cộng {flatCategories.length} danh mục
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs text-[var(--text-secondary)] mt-2 block">
                Đang dựng cây danh mục...
              </span>
            </div>
          ) : tree.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)]">
              Chưa có danh mục nào trong hệ thống. Hãy thêm danh mục đầu tiên từ cột bên trái.
            </div>
          ) : (
            <div className="space-y-2">
              {tree.map((rootNode) => renderCategoryNode(rootNode, 0))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
