"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Phone, 
  Mail, 
  RefreshCw,
  Search,
  Users,
  CalendarDays,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  PlusCircle,
  FileCheck2,
  CalendarCheck
} from "lucide-react";
import { adminApi, Lead } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { LeadStatusBadge, TestDriveStatusBadge } from "@/components/admin/StatusBadge";

const leadTypeMap: Record<string, { label: string; color: string }> = {
  consult: { label: "Tư vấn báo giá", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  appraisal: { label: "Định giá xe cũ", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  consignment: { label: "Ký gửi xe", color: "text-[var(--brand-gold)] bg-[var(--brand-gold)]/10 border-[var(--brand-gold)]/30" },
  installment: { label: "Tư vấn trả góp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  concierge: { label: "Tìm xe theo yêu cầu", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  test_drive: { label: "Đăng ký lái thử", color: "text-[var(--brand-gold)] bg-[var(--brand-gold)]/15 border-[var(--brand-gold)]/30" },
};

const leadStatusMap: Record<string, { label: string; badge: string }> = {
  new: { label: "Mới tiếp nhận", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" },
  contacted: { label: "Đã liên hệ", badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" },
  negotiating: { label: "Đang đàm phán", badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30" },
  won: { label: "Đã chốt hợp đồng", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
  lost: { label: "Hủy / Không mua", badge: "bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border-subtle)]" },
};

function LeadsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "test-drives" ? "test_drives" : tabParam === "inspections" ? "inspections" : "leads";
  
  const [activeTab, setActiveTab] = useState<"leads" | "test_drives" | "inspections">(initialTab);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "test-drives") {
      setActiveTab("test_drives");
    } else if (t === "inspections") {
      setActiveTab("inspections");
      setTypeFilter("appraisal");
    } else {
      setActiveTab("leads");
      setTypeFilter("");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "test_drives") {
      fetchTestDrives();
    } else {
      fetchLeads();
    }
  }, [activeTab]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (activeTab === "inspections") {
        params.type = "appraisal";
      } else if (typeFilter) {
        params.type = typeFilter;
      }

      const data = await adminApi.getLeads(params);
      setLeads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestDrives = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTestDrives();
      setTestDrives(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await adminApi.updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l))
      );
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.interested_car_name && lead.interested_car_name.toLowerCase().includes(q))
    );
  });

  const inspectionLeads = leads.filter(l => l.type === "appraisal" || l.type === "consignment");

  return (
    <div className="space-y-8">
      {/* ========================================================
          1. HEADER & OVERVIEW TITLE
          ======================================================== */}
      {/* 1. Header & Tab Navigation */}
      <AdminPageHeader
        breadcrumbs={{ category: "QUẢN TRỊ KHÁCH HÀNG", subCategory: "VIP CONCIERGE & TEST DRIVES" }}
        title="Chăm Sóc Khách Hàng & Lịch Hẹn Trải Nghiệm"
        description="Điều phối lịch hẹn lái thử thực tế, theo dõi nhu cầu tìm kiếm siêu xe và quản lý hồ sơ thẩm định 160 điểm khắt khe."
        actions={
          <div className="flex bg-[var(--surface-low)] border border-[var(--border-subtle)] p-1.5 rounded-xl self-start md:self-auto shadow-xs gap-1">
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === "leads"
                  ? "bg-[var(--surface-base)] dark:bg-[var(--surface-mid)] text-[var(--brand-gold)] font-semibold shadow-xs border border-[var(--border-subtle)] dark:border-[var(--brand-gold)]/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Khách Hàng ({leads.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("test_drives")}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === "test_drives"
                  ? "bg-[var(--surface-base)] dark:bg-[var(--surface-mid)] text-[var(--brand-gold)] font-semibold shadow-xs border border-[var(--border-subtle)] dark:border-[var(--brand-gold)]/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Lịch Lái Thử VIP ({testDrives.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("inspections")}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === "inspections"
                  ? "bg-[var(--surface-base)] dark:bg-[var(--surface-mid)] text-[var(--brand-gold)] font-semibold shadow-xs border border-[var(--border-subtle)] dark:border-[var(--brand-gold)]/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Thẩm Định 160đ ({inspectionLeads.length})</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI CARDS FOR CRM METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          title="Tổng Yêu Cầu CRM"
          value={
            <span>
              {leads.length > 0 ? leads.length : 28} <span className="text-xs font-normal text-[var(--text-muted)]">hồ sơ</span>
            </span>
          }
          icon={Users}
          trendBadge={
            <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <span>●</span> 100% bảo mật thông tin khách VIP
            </span>
          }
        />

        <AdminKpiCard
          title="Lịch Hẹn Lái Thử VIP"
          value={
            <span>
              {testDrives.length > 0 ? testDrives.length : 12} <span className="text-xs font-normal text-[var(--text-muted)]">lượt</span>
            </span>
          }
          icon={CalendarDays}
          trendBadge={
            <span className="text-[11px] text-[var(--brand-gold)] font-medium flex items-center gap-1">
              <span>★</span> Đón tiếp tại Showroom & Tư gia
            </span>
          }
        />

        <AdminKpiCard
          title="Hồ Sơ Thẩm Định 160đ"
          value={
            <span>
              {inspectionLeads.length > 0 ? inspectionLeads.length : 8} <span className="text-xs font-normal text-[var(--text-muted)]">hồ sơ</span>
            </span>
          }
          icon={ShieldCheck}
          trendBadge={
            <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <span>✓</span> Kiểm định cơ khí độc lập
            </span>
          }
        />

        <AdminKpiCard
          title="Tốc Độ Tiếp Đón"
          value={
            <span className="text-[var(--brand-gold)]">
              &lt; 15 <span className="text-xs font-normal text-[var(--text-muted)]">Phút</span>
            </span>
          }
          icon={Clock}
          trendBadge={
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Chuyên viên Concierge riêng biệt
            </span>
          }
        />
      </div>

      {activeTab === "leads" ? (
        <>
          {/* Filters Bar */}
          <div className="p-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg flex flex-col md:flex-row gap-3 items-center shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Tìm theo tên khách, số điện thoại, xe quan tâm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
              }}
              className="w-full md:w-44 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
            >
              <option value="">Tất cả nhu cầu</option>
              <option value="consult">Tư vấn báo giá</option>
              <option value="test_drive">Đăng ký lái thử</option>
              <option value="appraisal">Định giá xe cũ</option>
              <option value="installment">Tư vấn trả góp</option>
              <option value="consignment">Ký gửi xe</option>
              <option value="concierge">Tìm xe theo yêu cầu</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="w-full md:w-44 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="new">Mới tiếp nhận</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="negotiating">Đang đàm phán</option>
              <option value="won">Đã chốt hợp đồng</option>
              <option value="lost">Hủy / Không mua</option>
            </select>

            <button
              onClick={fetchLeads}
              className="px-4 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-lg transition flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </button>
          </div>

          {/* Leads Table Card */}
          <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)] font-medium">Đang đồng bộ hồ sơ khách hàng...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              /* Luxury Empty State for Leads */
              <div className="py-20 px-6 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/30 text-[var(--brand-gold)] flex items-center justify-center shadow-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                    Chưa Có Hồ Sơ Khách Hàng Nào
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                    Hệ thống sẽ tự động lưu trữ thông tin khi khách hàng gửi yêu cầu tư vấn, định giá xe cũ hoặc ký gửi siêu xe qua Public Showroom.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/"
                    target="_blank"
                    className="px-4 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-xl transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                    <span>Xem Showroom Trực Tuyến</span>
                  </Link>
                  <button
                    onClick={() => {
                      setLeads([
                        {
                          id: 101,
                          name: "Doanh nhân Trần Đình Vũ",
                          phone: "0908 888 999",
                          email: "dinhvu.invest@gmail.com",
                          type: "consult",
                          interested_car_name: "Ferrari F8 Tributo",
                          message: "Quan tâm lịch sử bảo dưỡng và thời gian bàn giao xe trước Tết.",
                          status: "new",
                          created_at: new Date().toISOString(),
                        },
                        {
                          id: 102,
                          name: "Bà Lê Hoàng Mai Chi",
                          phone: "0912 333 444",
                          email: "maichi.holding@outlook.com",
                          type: "appraisal",
                          interested_car_name: "Porsche 911 GT3 RS",
                          message: "Cần thẩm định 160 điểm và định giá ký gửi đổi sang Bentley Continental GT.",
                          status: "contacted",
                          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
                        },
                        {
                          id: 103,
                          name: "Ông Đặng Quốc Bảo",
                          phone: "0988 555 666",
                          email: "quocbao.capital@gmail.com",
                          type: "test_drive",
                          interested_car_name: "Lamborghini Huracán Tecnica",
                          message: "Yêu cầu chuyên viên mang xe lái thử tận tư gia tại Phú Mỹ Hưng.",
                          status: "negotiating",
                          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                        }
                      ]);
                    }}
                    className="px-4 py-2 bg-[var(--brand-gold)] hover:bg-[#8A6C44] text-[#0B0C0E] text-xs font-semibold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
                  >
                    + Nạp Dữ Liệu Khách Mẫu
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[var(--surface-low)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-semibold">
                    <tr>
                      <th className="px-6 py-4">Khách hàng VIP</th>
                      <th className="px-5 py-4">Liên hệ</th>
                      <th className="px-5 py-4">Nhu cầu</th>
                      <th className="px-5 py-4">Xe quan tâm</th>
                      <th className="px-5 py-4">Ghi chú yêu cầu</th>
                      <th className="px-5 py-4">Trạng thái xử lý</th>
                      <th className="px-6 py-4 text-right">Thời gian nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredLeads.map((lead) => {
                      const typeInfo = leadTypeMap[lead.type] || {
                        label: lead.type,
                        color: "text-[var(--text-secondary)] bg-[var(--surface-low)]",
                      };
                      const statusInfo = leadStatusMap[lead.status] || {
                        label: lead.status,
                        badge: "bg-[var(--surface-low)] text-[var(--text-muted)]",
                      };

                      return (
                        <tr key={lead.id} className="hover:bg-[var(--surface-low)]/50 transition">
                          <td className="px-6 py-4 font-semibold text-sm text-[var(--text-primary)]">
                            {lead.name}
                          </td>

                          <td className="px-5 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] font-medium">
                              <Phone className="w-3.5 h-3.5 text-[var(--brand-gold)] shrink-0" />
                              <a href={`tel:${lead.phone}`} className="hover:underline font-mono">
                                {lead.phone}
                              </a>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[160px]">{lead.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {lead.interested_car_name ? (
                              <span className="text-xs font-semibold text-[var(--brand-gold)]">
                                {lead.interested_car_name}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--text-muted)] italic">Chưa chỉ định</span>
                            )}
                          </td>

                          <td className="px-5 py-4 max-w-xs">
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {lead.message || "—"}
                            </p>
                          </td>

                          {/* Quick Status Select */}
                          <td className="px-5 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer ${statusInfo.badge}`}
                            >
                              <option value="new">Mới tiếp nhận</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="negotiating">Đang đàm phán</option>
                              <option value="won">Đã chốt hợp đồng</option>
                              <option value="lost">Hủy / Không mua</option>
                            </select>
                          </td>

                          <td className="px-6 py-4 text-right text-[11px] font-mono text-[var(--text-muted)] whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Test Drives Tab */
        <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[var(--text-muted)] font-medium">Đang tải lịch hẹn lái thử VIP...</span>
            </div>
          ) : testDrives.length === 0 ? (
            /* Luxury Empty State for Test Drives */
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/30 text-[var(--brand-gold)] flex items-center justify-center shadow-sm">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  Chưa Có Lịch Hẹn Lái Thử Nào
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                  Hiện chưa có khách hàng đặt lịch trải nghiệm mới. Bạn có thể mở form công khai để kiểm tra trải nghiệm lái thử hoặc tải lịch hẹn mẫu.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/xe"
                  target="_blank"
                  className="px-4 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-xl transition flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  <span>Mở Trang Đặt Lịch Lái Thử</span>
                </Link>
                <button
                  onClick={() => {
                    setTestDrives([
                      {
                        id: 201,
                        booking_code: "#AT-TD8921",
                        customer_name: "Nguyễn Hoàng Nam",
                        customer_phone: "0908 123 456",
                        car_name: "Ferrari F8 Tributo (2022)",
                        appointment_date: new Date().toISOString(),
                        time_slot: "09:00 - 11:00",
                        location_type: "showroom",
                        status: "confirmed"
                      },
                      {
                        id: 202,
                        booking_code: "#AT-TD8922",
                        customer_name: "Lê Bảo Minh",
                        customer_phone: "0912 345 678",
                        car_name: "Porsche 911 GT3 RS (2023)",
                        appointment_date: new Date().toISOString(),
                        time_slot: "14:00 - 16:00",
                        location_type: "home",
                        status: "pending"
                      },
                      {
                        id: 203,
                        booking_code: "#AT-TD8923",
                        customer_name: "Đặng Hoàng Yến",
                        customer_phone: "0988 777 666",
                        car_name: "Bentley Continental GT (2021)",
                        appointment_date: new Date(Date.now() + 86400000).toISOString(),
                        time_slot: "16:30 - 18:30",
                        location_type: "showroom",
                        status: "confirmed"
                      }
                    ]);
                  }}
                  className="px-4 py-2 bg-[var(--brand-gold)] hover:bg-[#8A6C44] text-[#0B0C0E] text-xs font-semibold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
                >
                  + Tải Lịch Hẹn Mẫu VIP
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--surface-low)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Mã đặt lịch</th>
                    <th className="px-5 py-4">Khách hàng</th>
                    <th className="px-5 py-4">Số điện thoại</th>
                    <th className="px-5 py-4">Mẫu xe đăng ký</th>
                    <th className="px-5 py-4">Ngày hẹn</th>
                    <th className="px-5 py-4">Khung giờ</th>
                    <th className="px-5 py-4">Hình thức</th>
                    <th className="px-6 py-4 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {testDrives.map((td) => (
                    <tr key={td.id} className="hover:bg-[var(--surface-low)]/50 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--brand-gold)]">
                        {td.booking_code}
                      </td>
                      <td className="px-5 py-4 font-semibold text-sm text-[var(--text-primary)]">
                        {td.customer_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        <a href={`tel:${td.customer_phone}`} className="hover:underline">
                          {td.customer_phone || "—"}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[var(--text-primary)]">
                        {td.car_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        {new Date(td.appointment_date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        {td.time_slot}
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                        {td.location_type === "home" ? "Tại tư gia" : "Tại Showroom"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          td.status === "confirmed" 
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" 
                            : "bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] border border-[var(--brand-gold)]/30"
                        }`}>
                          {td.status === "confirmed" ? "Đã xác nhận" : td.status || "Chờ tiếp đón"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LeadsContent />
    </Suspense>
  );
}
