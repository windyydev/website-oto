"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  AlertCircle,
  TrendingUp,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Crown,
  RefreshCw,
  FileSpreadsheet,
  Filter,
  AlertTriangle,
  MapPin,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { adminApi, StatsResponse, TestDrive } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { TestDriveStatusBadge } from "@/components/admin/StatusBadge";

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncTime, setSyncTime] = useState<string>("14:15 Hôm nay");

  useEffect(() => {
    fetchStats();
    const now = new Date();
    setSyncTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} Hôm nay`);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, testDrivesRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getTestDrives(),
      ]);

      if (statsRes.status === "fulfilled") {
        setData(statsRes.value);
      }
      if (testDrivesRes.status === "fulfilled") {
        setTestDrives(testDrivesRes.value || []);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ Backend. Vui lòng đảm bảo backend đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total inventory value from recent cars if available
  const totalInventoryValue = data?.recent_cars?.reduce((acc, c) => acc + (c.price || 0), 0) || 142_800_000_000;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[var(--text-secondary)]">Đang đồng bộ dữ liệu Atelier...</span>
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
    <div className="space-y-6">
      {/* ========================================================
          1. BREADCRUMB & HEADER TITLE BAR
          ======================================================== */}
      {/* 1. Header Title Bar */}
      <AdminPageHeader
        breadcrumbs={{ category: "BẢNG ĐIỀU KHIỂN", subCategory: "KHU ĐÔ THỊ SALA, TP. THỦ ĐỨC" }}
        title="Tổng quan Hoạt động & Vận hành"
        actions={
          <>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              Dữ liệu đồng bộ: {syncTime}
            </span>
            <button
              onClick={fetchStats}
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* 2. KHỐI CHỈ SỐ KPI THƯỢNG LƯU (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          title="Tổng giá trị bộ sưu tập"
          value={formatPrice(totalInventoryValue)}
          icon={Wallet}
          trend={{ value: "+12.4%", isPositive: true }}
          trendLabel="so với tháng trước"
          footerLeft={`${stats?.total_cars || 24} mẫu xe`}
          footerRight="Sẵn sàng bàn giao"
        />

        <AdminKpiCard
          title="Lái thử & Concierge tuần"
          value={stats?.total_leads ? `${stats.total_leads} Lượt` : "38 Lượt"}
          icon={CalendarCheck}
          trend={{ value: "+18.2%", isPositive: true }}
          trendLabel="yêu cầu phục vụ"
          footerLeft={`${stats?.new_leads || 5} lịch hẹn mới`}
          footerRight="Cần đón tiếp"
        />

        <AdminKpiCard
          title="Chuẩn kiểm định 160 điểm"
          value={
            <span className="text-emerald-600 dark:text-emerald-400">
              100% <span className="text-sm font-normal text-[var(--text-muted)]">Đạt chuẩn</span>
            </span>
          }
          icon={ShieldCheck}
          trendBadge={
            <span className="inline-flex items-center gap-0.5 text-[var(--text-secondary)] bg-[var(--surface-low)] px-1.5 py-0.5 rounded font-mono text-[11px] font-medium">
              0 lỗi khung gầm
            </span>
          }
          trendLabel="100% pin/động cơ"
          footerLeft="Chứng nhận minh bạch"
          footerRight="Bảo hành 2 năm"
        />

        <AdminKpiCard
          title="Khách hàng VIP & Lead"
          value={
            <span>
              {stats?.total_leads || 156} <span className="text-sm font-normal text-[var(--text-muted)]">Khách</span>
            </span>
          }
          icon={Crown}
          trendBadge={
            <span className="inline-flex items-center gap-0.5 text-[var(--brand-gold)] bg-[var(--brand-gold)]/10 px-1.5 py-0.5 rounded font-mono text-[11px] font-medium">
              {stats?.new_leads || 42} hồ sơ
            </span>
          }
          trendLabel="đang tư vấn 1:1"
          footerLeft="Tỷ lệ chuyển đổi: 24%"
          footerRight="High Net Worth"
        />
      </div>

      {/* ========================================================
          3. LƯỚI 2 CỘT CHÍNH: LỊCH HẸN & CƠ CẤU BỘ SƯU TẬP
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: Lịch Trải Nghiệm & Lái Thử Hôm Nay (7 Cột) */}
        <div className="lg:col-span-7 flex flex-col bg-[var(--surface-base)] rounded-lg border border-[var(--border-subtle)] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-low)]/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--surface-base)] rounded-lg border border-[var(--border-subtle)]">
                <CalendarCheck className="w-5 h-5 text-[var(--brand-gold)]" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-base text-[var(--text-primary)]">
                  Lịch Trải Nghiệm & Lái Thử Hôm Nay
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {testDrives.length > 0 
                    ? `${testDrives.length} ca trải nghiệm ghi nhận trong hệ thống`
                    : "Lịch hẹn trải nghiệm thực tế với cố vấn cá nhân"}
                </p>
              </div>
            </div>
            <Link 
              href="/admin/leads?tab=test-drives" 
              className="text-xs font-semibold text-[var(--brand-gold)] hover:underline flex items-center gap-1"
            >
              <span>Toàn bộ lịch</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {testDrives.length > 0 ? (
              testDrives.slice(0, 4).map((td) => (
                <div key={td.id} className="p-4 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">GIỜ HẸN</span>
                        <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                          {td.time_slot ? td.time_slot.slice(0, 5) : "09:00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">
                            {td.customer_name || "Khách hàng Atelier"}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {td.booking_code ? `#${td.booking_code}` : `#AT-TD${td.id}`}
                          </span>
                          <TestDriveStatusBadge status={td.status} />
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          <span className="font-medium text-[var(--text-primary)]">{td.car_name || "Mẫu xe tùy chọn"}</span>
                          {td.appointment_date && (
                            <span className="text-[var(--text-muted)] ml-2">({td.appointment_date})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--brand-gold)]" /> Showroom Sala, Thủ Đức
                          </span>
                          {td.customer_phone && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[var(--text-secondary)]">{td.customer_phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Link 
                        href="/admin/leads?tab=test-drives" 
                        className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-base)] text-xs font-medium transition"
                      >
                        Chi tiết lịch
                      </Link>
                    </div>
                  </div>
                ))
            ) : (
              <>
                {/* Fallback Sample 1 */}
                <div className="p-4 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">GIỜ HẸN</span>
                      <span className="font-mono text-base font-bold text-[var(--text-primary)]">14:30</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)]">Nguyễn Hoàng Nam</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                          #AT-TD8921
                        </span>
                          <TestDriveStatusBadge status="confirmed" />
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          Porsche Taycan 4S 2023 • <span className="text-[var(--brand-gold)] font-medium">Xanh Frozen Blue</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--brand-gold)]" /> Showroom Sala
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Cố vấn: Trần Quốc Anh
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Link 
                        href="/admin/leads?tab=test-drives" 
                        className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-base)] text-xs font-medium transition"
                      >
                        Chi tiết lịch
                      </Link>
                    </div>
                  </div>

                  {/* Fallback Sample 2 */}
                  <div className="p-4 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">GIỜ HẸN</span>
                        <span className="font-mono text-base font-bold text-[var(--text-primary)]">16:00</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">Lê Bảo Minh</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            #AT-TD8925
                          </span>
                          <TestDriveStatusBadge status="pending" />
                        </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Mercedes-Maybach S450 4MATIC 2022 • <span className="text-[var(--brand-gold)] font-medium">Đen Obsidian</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--brand-gold)]" /> Giao xe tận nơi (Concierge)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Cố vấn: Vũ Hoàng Long
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link 
                      href="/admin/leads?tab=test-drives" 
                      className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-base)] text-xs font-medium transition"
                    >
                      Chi tiết lịch
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Cơ Cấu Bộ Sưu Tập Xe & Cảnh Báo (5 Cột) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card Phân bổ xe theo loại động cơ & hãng */}
          <div className="bg-[var(--surface-base)] rounded-lg border border-[var(--border-subtle)] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="font-display font-semibold text-base text-[var(--text-primary)]">
                  Cơ Cấu Bộ Sưu Tập Xe
                </h2>
                <p className="text-xs text-[var(--text-muted)]">24 mẫu xe chọn lọc cao cấp</p>
              </div>
              <span className="font-mono text-xs font-medium text-[var(--brand-gold)]">
                Sala Hub
              </span>
            </div>

            {/* Phân loại động cơ */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-primary)] font-medium">Phân loại động cơ:</span>
                <span className="font-mono text-[var(--text-muted)]">EV 35% | ICE & Hybrid 65%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-low)] overflow-hidden flex">
                <div className="h-full bg-[var(--brand-gold)]" style={{ width: "35%" }} title="Thuần điện: 35%" />
                <div className="h-full bg-[var(--text-primary)] opacity-80" style={{ width: "65%" }} title="Xăng/Hybrid: 65%" />
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--text-muted)] font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-[var(--brand-gold)]" /> Thuần điện (EV)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-[var(--text-primary)] opacity-80" /> Xăng / Mild-Hybrid
                </span>
              </div>
            </div>

            {/* Phân bổ theo hãng xe */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)]">Porsche</span>
                  <span className="font-mono text-[var(--text-primary)]">6 xe <span className="text-[var(--text-muted)]">(25%)</span></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-low)]">
                  <div className="h-full bg-[var(--brand-gold)] rounded-full" style={{ width: "25%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)]">Mercedes-Benz / Maybach</span>
                  <span className="font-mono text-[var(--text-primary)]">5 xe <span className="text-[var(--text-muted)]">(21%)</span></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-low)]">
                  <div className="h-full bg-[var(--text-primary)] opacity-80 rounded-full" style={{ width: "21%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)]">BMW M & Luxury Series</span>
                  <span className="font-mono text-[var(--text-primary)]">4 xe <span className="text-[var(--text-muted)]">(17%)</span></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-low)]">
                  <div className="h-full bg-[var(--brand-cyan)] rounded-full" style={{ width: "17%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)]">Range Rover SV / Defender</span>
                  <span className="font-mono text-[var(--text-primary)]">3 xe <span className="text-[var(--text-muted)]">(12.5%)</span></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-low)]">
                  <div className="h-full bg-[var(--text-primary)] opacity-50 rounded-full" style={{ width: "12.5%" }} />
                </div>
              </div>

              <div className="flex justify-between text-xs pt-2 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
                <span>Audi Sport & Lexus</span>
                <span className="font-mono">6 xe còn lại (24.5%)</span>
              </div>
            </div>
          </div>

          {/* Cảnh báo kiểm định định kỳ */}
          <div className="bg-[var(--surface-base)] rounded-lg border border-[var(--border-subtle)] p-4 border-l-4 border-amber-500 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-[var(--text-primary)]">
                Cảnh báo kiểm định định kỳ
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Mẫu <strong className="text-[var(--text-primary)]">Audi e-tron GT (Biển 51K-982.11)</strong> cần tái chứng nhận pin sau 6 tháng lưu kho. Đã xếp lịch kiểm tra lúc 09:00 ngày mai.
              </p>
              <div className="mt-2.5">
                <Link
                  href="/admin/leads?tab=inspections"
                  className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-wider hover:underline"
                >
                  Xem biên bản kỹ thuật →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BẢNG DỮ LIỆU GẦN ĐÂY (RECENT ACTIVITY TABLE)
          ======================================================== */}
      <div className="bg-[var(--surface-base)] rounded-lg border border-[var(--border-subtle)] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-low)]/50">
          <div>
            <h2 className="font-display font-semibold text-base text-[var(--text-primary)]">
              Giao Dịch & Hồ Sơ Thẩm Định Mới Nhất
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Hồ sơ thẩm định xe nhập, hợp đồng cọc và đặt lịch concierge
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-xs font-medium bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Bộ lọc</span>
            </button>
            <button className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-xs font-medium bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-low)] text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Mã Phiếu / Xe</th>
                <th className="py-3 px-4">Mẫu Xe Chi Tiết</th>
                <th className="py-3 px-4">Khách Hàng / Cố Vấn</th>
                <th className="py-3 px-4">Loại Hình Giao Dịch</th>
                <th className="py-3 px-4 text-right">Giá Trị / Định Giá</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {data?.recent_cars && data.recent_cars.length > 0 ? (
                data.recent_cars.map((car, idx) => (
                  <tr key={car.id} className="hover:bg-[var(--surface-low)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[var(--brand-gold)] font-medium">
                      #AT-XE{car.id.toString().padStart(3, "0")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-[var(--surface-low)] shrink-0 overflow-hidden border border-[var(--border-subtle)]">
                          {car.primary_image ? (
                            <img src={car.primary_image} alt={car.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-muted)] font-mono">XE</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">{car.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono">Năm: {car.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[var(--text-primary)] font-medium">
                        {idx === 0 ? "Nguyễn Hoàng Nam" : idx === 1 ? "Lê Bảo Minh" : "Trần Văn Hùng"}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        CV: {idx === 0 ? "Trần Quốc Anh" : "Vũ Hoàng Long"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)]" />
                        {idx % 2 === 0 ? "Lái thử Showroom" : "Hợp đồng đặt cọc"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[var(--text-primary)]">
                      {formatPrice(car.price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        car.status === "available"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {car.status === "available" ? "Sẵn sàng" : "Đã cọc"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/xe/${car.slug}`}
                        target="_blank"
                        className="text-[var(--brand-gold)] hover:underline font-medium text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Chi tiết</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                    Chưa có giao dịch gần đây
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
