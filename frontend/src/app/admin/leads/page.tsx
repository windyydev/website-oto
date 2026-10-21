"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  CarFront, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { adminApi, Lead } from "@/lib/api";

const leadTypeMap: Record<string, { label: string; color: string }> = {
  consult: { label: "Tư vấn báo giá", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  appraisal: { label: "Định giá xe cũ", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  consignment: { label: "Ký gửi xe", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  installment: { label: "Tư vấn trả góp", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  concierge: { label: "Tìm xe theo yêu cầu", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  test_drive: { label: "Đăng ký lái thử", color: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
};

const leadStatusMap: Record<string, { label: string; badge: string }> = {
  new: { label: "Mới tiếp nhận", badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  contacted: { label: "Đã liên hệ", badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  negotiating: { label: "Đang đàm phán", badge: "bg-purple-500/15 text-purple-400 border border-purple-500/30" },
  won: { label: "Đã chốt hợp đồng", badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  lost: { label: "Hủy / Không mua", badge: "bg-zinc-800 text-zinc-400 border border-zinc-700" },
};

export default function AdminLeadsPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "test_drives">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

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
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        )
      );
    } catch (err: any) {
      alert("Không thể cập nhật trạng thái: " + (err.response?.data?.detail || err.message));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản Lý Khách Hàng (Leads)</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Theo dõi danh sách khách hàng tiềm năng, lịch hẹn lái thử và nhu cầu mua xe.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "leads"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Tất Cả Khách Hàng ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("test_drives")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "test_drives"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Lịch Lái Thử ({testDrives.length})
          </button>
        </div>
      </div>

      {activeTab === "leads" ? (
        <>
          {/* Filters Bar */}
          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm theo tên khách, số điện thoại, xe quan tâm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
              }}
              className="w-full md:w-44 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
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
              className="w-full md:w-44 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
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
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </button>
          </div>

          {/* Leads Table */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400">Đang tải danh sách khách hàng...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-20 text-center text-xs text-zinc-500">
                Không tìm thấy khách hàng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
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
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredLeads.map((lead) => {
                      const typeInfo = leadTypeMap[lead.type] || {
                        label: lead.type,
                        color: "text-zinc-400 bg-zinc-800",
                      };
                      const statusInfo = leadStatusMap[lead.status] || {
                        label: lead.status,
                        badge: "bg-zinc-800 text-zinc-400",
                      };

                      return (
                        <tr key={lead.id} className="hover:bg-zinc-800/30 transition">
                          <td className="px-5 py-4 font-semibold text-white">
                            {lead.name}
                          </td>

                          <td className="px-4 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <a href={`tel:${lead.phone}`} className="hover:underline">
                                {lead.phone}
                              </a>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {lead.interested_car_name ? (
                              <span className="text-xs font-semibold text-amber-400">
                                {lead.interested_car_name}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-500">Chưa chỉ định</span>
                            )}
                          </td>

                          <td className="px-4 py-4 max-w-xs">
                            <p className="text-xs text-zinc-400 truncate">
                              {lead.message || "—"}
                            </p>
                          </td>

                          {/* Quick Status Select */}
                          <td className="px-4 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer ${statusInfo.badge}`}
                            >
                              <option value="new">Mới tiếp nhận</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="negotiating">Đang đàm phán</option>
                              <option value="won">Đã chốt hợp đồng</option>
                              <option value="lost">Hủy / Không mua</option>
                            </select>
                          </td>

                          <td className="px-5 py-4 text-right text-xs text-zinc-400 whitespace-nowrap">
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
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-400">Đang tải lịch hẹn lái thử...</span>
            </div>
          ) : testDrives.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500">
              Chưa có lịch hẹn lái thử nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
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
                <tbody className="divide-y divide-zinc-800/60">
                  {testDrives.map((td) => (
                    <tr key={td.id} className="hover:bg-zinc-800/30 transition">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400">
                        {td.booking_code}
                      </td>
                      <td className="px-4 py-4 font-semibold text-white">
                        {td.customer_name || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-300">
                        {td.customer_phone || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-zinc-200">
                        {td.car_name || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-300">
                        {new Date(td.appointment_date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-300">
                        {td.time_slot}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
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
