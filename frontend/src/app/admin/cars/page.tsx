"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CarFront, 
  PlusCircle, 
  Search, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Pencil
} from "lucide-react";
import { adminApi, Car, Brand } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { CarStatusBadge } from "@/components/admin/StatusBadge";

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");

  useEffect(() => {
    fetchBrands();
    fetchCars();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await adminApi.getBrands();
      setBrands(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params: any = { page_size: 50 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (brandId) params.brand_id = parseInt(brandId);

      const res = await adminApi.getCars(params);
      setCars(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}"? Hành động này sẽ dọn dẹp toàn bộ ảnh lưu trên Cloudinary và không thể hoàn tác.`)) {
      return;
    }

    try {
      await adminApi.deleteCar(id);
      fetchCars();
    } catch (err: any) {
      alert("Lỗi khi xóa xe: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <AdminPageHeader
        breadcrumbs={{ category: "BẢNG ĐIỀU KHIỂN", subCategory: "KHO XE SALA" }}
        title="Quản Lý Bộ Sưu Tập Xe"
        description={`Hiện có ${total} mẫu xe đang được trưng bày và phân phối.`}
        actions={
          <Link
            href="/admin/cars/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs transition shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Xe Mới</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg flex flex-col md:flex-row gap-3 items-center shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm theo tên xe (VD: Porsche, Taycan, Mercedes Maybach...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchCars()}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
          />
        </div>

        {/* Brand Select */}
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
        >
          <option value="">Tất cả hãng xe</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full md:w-40 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Sẵn sàng bán</option>
          <option value="reserved">Đã nhận cọc</option>
          <option value="sold">Đã bán</option>
        </select>

        <button
          onClick={fetchCars}
          className="px-4 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-lg transition flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[var(--text-muted)]">Đang tải danh sách xe...</span>
          </div>
        ) : cars.length === 0 ? (
          <AdminEmptyState
            icon={CarFront}
            title="Không tìm thấy mẫu xe nào phù hợp"
            description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm mẫu xe mới vào bộ sưu tập Atelier."
            actions={
              <Link
                href="/admin/cars/create"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--brand-primary)] text-[var(--text-inverted)] text-xs font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Thêm xe đầu tiên
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--surface-low)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Xe & Mã kho</th>
                  <th className="px-4 py-3.5">Giá bán</th>
                  <th className="px-4 py-3.5">Năm / ODO</th>
                  <th className="px-4 py-3.5">Kiểu dáng / Nhiên liệu</th>
                  <th className="px-4 py-3.5">Tình trạng</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {cars.map((car) => {
                  const primaryImg =
                    car.images?.find((img) => img.is_primary)?.image_url ||
                    car.images?.[0]?.image_url;

                  return (
                    <tr key={car.id} className="hover:bg-[var(--surface-low)]/50 transition">
                      {/* Car info with image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg bg-[var(--surface-low)] overflow-hidden shrink-0 border border-[var(--border-subtle)] flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={car.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CarFront className="w-5 h-5 text-[var(--text-muted)]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{car.name}</p>
                            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5 truncate">
                              Kho: {car.stock_code || `#${car.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div className="font-semibold font-mono text-[var(--brand-gold)]">
                          {formatPrice(car.price)}
                        </div>
                        {car.monthly_installment && (
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
                            ~{car.monthly_installment.toLocaleString()} đ/th
                          </div>
                        )}
                      </td>

                      {/* Year / Odo */}
                      <td className="px-4 py-4 font-mono">
                        <div className="text-[var(--text-primary)] font-medium">{car.year}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {car.odo_km.toLocaleString()} km
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-4">
                        <div className="text-[var(--text-primary)] capitalize font-medium">{car.body_type}</div>
                        <div className="text-[11px] text-[var(--text-muted)] capitalize">{car.fuel_type}</div>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-low)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {car.condition === "new" ? "Xe mới 100%" : "Đã qua sử dụng"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <CarStatusBadge status={car.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            title="Chỉnh sửa thông tin xe"
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--brand-gold)] hover:bg-[var(--surface-low)] transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/xe/${car.slug}`}
                            target="_blank"
                            title="Xem trang chi tiết"
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCar(car.id, car.name)}
                            title="Xóa xe"
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
