"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, AlertCircle } from "lucide-react";
import { adminApi, Brand } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("Đức");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBrands();
      setBrands(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await adminApi.createBrand({
        name: name.trim(),
        slug: slug.trim(),
        country: country.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      });

      // Reset form
      setName("");
      setSlug("");
      setLogoUrl("");
      fetchBrands();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Không thể tạo thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: number, brandName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thương hiệu "${brandName}"?`)) return;

    try {
      await adminApi.deleteBrand(id);
      fetchBrands();
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={{ category: "BẢNG ĐIỀU KHIỂN", subCategory: "DANH MỤC THƯƠNG HIỆU" }}
        title="Quản Lý Thương Hiệu & Hãng Xe"
        description="Khai báo các hãng xe đối tác phân phối chính thức tại Showroom Atelier."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Add Brand */}
        <div className="p-5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg space-y-4 h-fit shadow-xs">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--brand-gold)]" />
            Thêm Hãng Xe Mới
          </h2>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateBrand} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Tên hãng xe</label>
              <input
                type="text"
                required
                placeholder="VD: Porsche, Mercedes-Benz..."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Slug URL</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-1.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-muted)] font-mono focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Quốc gia xuất xứ</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="VD: Đức, Nhật Bản, Ý..."
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Logo URL (tuỳ chọn)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? "Đang lưu..." : "Lưu Hãng Xe"}
            </button>
          </form>
        </div>

        {/* Right List: Brands */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Danh Sách Hãng Xe ({brands.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[var(--text-muted)]">Đang tải thương hiệu...</span>
            </div>
          ) : brands.length === 0 ? (
            <div className="p-8 text-center bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-muted)]">
              Chưa có thương hiệu nào. Hãy tạo thương hiệu đầu tiên bên trái.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between hover:border-[var(--brand-gold)] transition shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Tag className="w-5 h-5 text-[var(--brand-gold)]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--text-primary)]">{b.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                        <span className="font-mono text-[10px]">/{b.slug}</span>
                        {b.country && (
                          <>
                            <span>•</span>
                            <span>{b.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-60 group-hover:opacity-100"
                    title="Xóa hãng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
