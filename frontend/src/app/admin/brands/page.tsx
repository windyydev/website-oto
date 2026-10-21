"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Globe, AlertCircle, Check } from "lucide-react";
import { adminApi, Brand } from "@/lib/api";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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
        slug: slug.trim() || slugify(name),
        country: country.trim(),
        logo_url: logoUrl.trim() || undefined,
      });

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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Quản Lý Thương Hiệu</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Khai báo các hãng xe đối tác phân phối tại Showroom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Add Brand */}
        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-4 h-fit">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Thêm Hãng Xe Mới
          </h2>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateBrand} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Tên hãng xe</label>
              <input
                type="text"
                required
                placeholder="VD: Porsche, Mercedes-Benz..."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Quốc gia xuất xứ</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="VD: Đức, Nhật Bản, Ý..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Logo URL (tuỳ chọn)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Thêm Thương Hiệu"}
            </button>
          </form>
        </div>

        {/* Right List: Brands Table */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Danh Sách Thương Hiệu ({brands.length})
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500">Đang tải...</div>
          ) : brands.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              Chưa có thương hiệu nào. Hãy tạo thương hiệu đầu tiên ở form bên trái!
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {brands.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-amber-400 font-bold overflow-hidden">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        b.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{b.name}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3 text-zinc-500" />
                        {b.country || "Chưa rõ"} • <span className="font-mono text-zinc-500">{b.slug}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Xóa thương hiệu"
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
