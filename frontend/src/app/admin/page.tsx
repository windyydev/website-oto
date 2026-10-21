"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CarFront, 
  Users, 
  Tag, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  PhoneCall,
  AlertCircle
} from "lucide-react";
import { adminApi, StatsResponse } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ Backend. Vui lòng đảm bảo backend đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(2)} tỷ`;
    }
    return `${(price / 1_000_000).toFixed(0)} triệu`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400">Đang tải dữ liệu tổng quan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Lỗi kết nối Backend</h4>
          <p className="text-xs mt-1 text-red-300">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-xs font-medium rounded-lg transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Bảng Điều Khiển Tổng Quan</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Chào mừng bạn trở lại, theo dõi kho xe và yêu cầu khách hàng mới nhất.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition shadow-lg shadow-amber-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Xe Mới</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tổng xe trong kho</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CarFront className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{stats?.total_cars || 0}</div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">{stats?.available_cars || 0}</span> xe sẵn sàng bán
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Xe đã bán thành công</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{stats?.sold_cars || 0}</div>
            <div className="text-xs text-zinc-400 mt-1">Đã bàn giao cho khách</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Khách hàng liên hệ (Leads)</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{stats?.total_leads || 0}</div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <span className="text-amber-400 font-medium">{stats?.new_leads || 0}</span> yêu cầu mới cần xử lý
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Hãng xe đối tác</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{stats?.total_brands || 0}</div>
            <div className="text-xs text-zinc-400 mt-1">Thương hiệu trên hệ thống</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Leads & Recent Cars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="font-semibold text-white text-base">Yêu Cầu Khách Hàng Mới</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Khách đăng ký tư vấn, lái thử, định giá</p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60 flex-1">
            {(!data?.recent_leads || data.recent_leads.length === 0) ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Chưa có yêu cầu khách hàng nào.
              </div>
            ) : (
              data.recent_leads.map((lead) => (
                <div key={lead.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{lead.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-zinc-500" />
                        {lead.phone}
                      </span>
                      {lead.interested_car_name && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/90 truncate max-w-[150px]">
                            {lead.interested_car_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        lead.status === "new"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {lead.status === "new" ? "Mới tiếp nhận" : lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Cars */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="font-semibold text-white text-base">Xe Mới Nhập Kho</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Các dòng xe vừa thêm vào showroom</p>
            </div>
            <Link
              href="/admin/cars"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60 flex-1">
            {(!data?.recent_cars || data.recent_cars.length === 0) ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Chưa có xe nào trong kho. Hãy bấm &quot;Thêm Xe Mới&quot; để bắt đầu!
              </div>
            ) : (
              data.recent_cars.map((car) => (
                <div key={car.id} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-11 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50 flex items-center justify-center">
                    {car.primary_image ? (
                      <img
                        src={car.primary_image}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CarFront className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{car.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Năm {car.year}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-amber-400">
                      {formatPrice(car.price)}
                    </p>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {car.status === "available" ? "Sẵn sàng" : car.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
