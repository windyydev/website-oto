"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Phone, 
  Mail, 
  RefreshCw,
  Search
} from "lucide-react";
import { adminApi, Lead } from "@/lib/api";

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
  const initialTab = searchParams.get("tab") === "test-drives" ? "test_drives" : "leads";
  const [activeTab, setActiveTab] = useState<"leads" | "test_drives">(initialTab);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "test-drives") {
      setActiveTab("test_drives");
    } else if (tabParam === "leads" || tabParam === "inspections") {
      setActiveTab("leads");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    } else {
      fetchTestDrives();
    }
  }, [activeTab]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const data = await adminApi.getLeads(params);
      setLeads(data);
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
      setTestDrives(data);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            <span>BẢNG ĐIỀU KHIỂN</span>
            <span>•</span>
            <span className="text-[var(--brand-gold)]">CHĂM SÓC KHÁCH HÀNG</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Quản Lý Khách Hàng & Lịch Lái Thử
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Theo dõi danh sách khách hàng tiềm năng, lịch hẹn lái thử và nhu cầu concierge.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[var(--surface-base)] border border-[var(--border-subtle)] p-1 rounded-lg shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${
              activeTab === "leads"
                ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Tất Cả Khách Hàng ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("test_drives")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${
              activeTab === "test_drives"
                ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Lịch Lái Thử ({testDrives.length})
          </button>
        </div>
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

          {/* Leads Table */}
          <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-7 h-7 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)]">Đang tải danh sách khách hàng...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-20 text-center text-xs text-[var(--text-muted)]">
                Không tìm thấy khách hàng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[var(--surface-low)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Khách hàng</th>
                      <th className="px-4 py-3.5">Liên hệ</th>
                      <th className="px-4 py-3.5">Nhu cầu</th>
                      <th className="px-4 py-3.5">Xe quan tâm</th>
                      <th className="px-4 py-3.5">Tin nhắn</th>
                      <th className="px-4 py-3.5">Trạng thái xử lý</th>
                      <th className="px-5 py-3.5 text-right">Ngày gửi</th>
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
                          <td className="px-5 py-4 font-semibold text-sm text-[var(--text-primary)]">
                            {lead.name}
                          </td>

                          <td className="px-4 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] font-medium">
                              <Phone className="w-3.5 h-3.5 text-[var(--brand-gold)] shrink-0" />
                              <a href={`tel:${lead.phone}`} className="hover:underline font-mono">
                                {lead.phone}
                              </a>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium border ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {lead.interested_car_name ? (
                              <span className="text-xs font-semibold text-[var(--brand-gold)]">
                                {lead.interested_car_name}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--text-muted)]">Chưa chỉ định</span>
                            )}
                          </td>

                          <td className="px-4 py-4 max-w-xs">
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {lead.message || "—"}
                            </p>
                          </td>

                          {/* Quick Status Select */}
                          <td className="px-4 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`text-[11px] font-semibold rounded px-2.5 py-1 focus:outline-none cursor-pointer ${statusInfo.badge}`}
                            >
                              <option value="new">Mới tiếp nhận</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="negotiating">Đang đàm phán</option>
                              <option value="won">Đã chốt hợp đồng</option>
                              <option value="lost">Hủy / Không mua</option>
                            </select>
                          </td>

                          <td className="px-5 py-4 text-right text-[11px] font-mono text-[var(--text-muted)] whitespace-nowrap">
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
        <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[var(--text-muted)]">Đang tải lịch hẹn lái thử...</span>
            </div>
          ) : testDrives.length === 0 ? (
            <div className="py-20 text-center text-xs text-[var(--text-muted)]">
              Chưa có lịch hẹn lái thử nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--surface-low)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Mã đặt lịch</th>
                    <th className="px-4 py-3.5">Khách hàng</th>
                    <th className="px-4 py-3.5">Số điện thoại</th>
                    <th className="px-4 py-3.5">Xe đăng ký</th>
                    <th className="px-4 py-3.5">Ngày hẹn</th>
                    <th className="px-4 py-3.5">Khung giờ</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {testDrives.map((td) => (
                    <tr key={td.id} className="hover:bg-[var(--surface-low)]/50 transition">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--brand-gold)]">
                        {td.booking_code}
                      </td>
                      <td className="px-4 py-4 font-semibold text-sm text-[var(--text-primary)]">
                        {td.customer_name || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        {td.customer_phone || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-[var(--text-primary)]">
                        {td.car_name || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        {new Date(td.appointment_date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-[var(--text-secondary)]">
                        {td.time_slot}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                          {td.status}
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
