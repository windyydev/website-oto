"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CarFront, 
  PlusCircle, 
  Search, 
  Trash2, 
  ExternalLink, 
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { adminApi, Car, Brand } from "@/lib/api";

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
    if (!confirm(`Bạn có chắc chắn muốn xóa xe "${name}" không? Toàn bộ ảnh trên Cloudinary cũng sẽ được xóa sạch.`)) {
      return;
    }
    try {
      await adminApi.deleteCar(id);
      fetchCars();
    } catch (err: any) {
      alert("Lỗi khi xóa xe: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(2)} tỷ`;
    }
    return `${(price / 1_000_000).toFixed(0)} triệu`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản Lý Danh Sách Xe</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tổng cộng <span className="text-amber-400 font-semibold">{total}</span> xe trong kho
          </p>
        </div>
        <Link
          href="/admin/cars/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition shadow-lg shadow-amber-500/10 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Xe Mới</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col md:flex-row gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo tên xe (VD: Porsche, Mercedes C300...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchCars()}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Brand Select */}
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
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
          className="w-full md:w-40 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Sẵn sàng bán</option>
          <option value="reserved">Đã nhận cọc</option>
          <option value="sold">Đã bán</option>
        </select>

        <button
          onClick={fetchCars}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400">Đang tải danh sách xe...</span>
          </div>
        ) : cars.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CarFront className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">Không tìm thấy chiếc xe nào phù hợp.</p>
            <Link
              href="/admin/cars/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-400 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Thêm xe đầu tiên
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Xe</th>
                  <th className="px-4 py-3.5">Giá bán</th>
                  <th className="px-4 py-3.5">Năm / ODO</th>
                  <th className="px-4 py-3.5">Kiểu dáng / Nhiên liệu</th>
                  <th className="px-4 py-3.5">Tình trạng</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {cars.map((car) => {
                  const primaryImg =
                    car.images?.find((img) => img.is_primary)?.image_url ||
                    car.images?.[0]?.image_url;

                  return (
                    <tr key={car.id} className="hover:bg-zinc-800/30 transition">
                      {/* Car info with image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50 flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={car.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CarFront className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{car.name}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 truncate">
                              Mã kho: {car.stock_code || `#${car.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-amber-400">
                          {formatPrice(car.price)}
                        </div>
                        {car.monthly_installment && (
                          <div className="text-xs text-zinc-400">
                            ~{car.monthly_installment.toLocaleString()} đ/th
                          </div>
                        )}
                      </td>

                      {/* Year / Odo */}
                      <td className="px-4 py-4">
                        <div className="text-zinc-200">{car.year}</div>
                        <div className="text-xs text-zinc-400">
                          {car.odo_km.toLocaleString()} km
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-4">
                        <div className="text-zinc-200 capitalize">{car.body_type}</div>
                        <div className="text-xs text-zinc-400 capitalize">{car.fuel_type}</div>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
                          {car.condition === "new" ? "Xe mới 100%" : "Đã qua sử dụng"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            car.status === "available"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : car.status === "reserved"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {car.status === "available"
                            ? "Sẵn sàng"
                            : car.status === "reserved"
                            ? "Đã cọc"
                            : "Đã bán"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/xe/${car.slug}`}
                            target="_blank"
                            title="Xem trang chi tiết"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCar(car.id, car.name)}
                            title="Xóa xe"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
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
