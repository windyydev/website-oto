import React from "react";

// ─── 1. Car Status Badge ─────────────────────────────────────────────────────
export function CarStatusBadge({ status }: { status: "available" | "reserved" | "sold" | string }) {
  switch (status) {
    case "available":
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Sẵn sàng
        </span>
      );
    case "reserved":
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Đã nhận cọc
        </span>
      );
    case "sold":
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
          Đã bán
        </span>
      );
    default:
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--surface-low)] text-[var(--text-muted)]">
          {status}
        </span>
      );
  }
}

// ─── 2. Test Drive Status Badge ──────────────────────────────────────────────
export function TestDriveStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s.includes("xác nhận")) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
        ĐÃ XÁC NHẬN
      </span>
    );
  }
  if (s === "completed" || s.includes("hoàn thành") || s.includes("đón tiếp")) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px] border border-blue-500/20">
        HOÀN THÀNH
      </span>
    );
  }
  if (s === "cancelled" || s.includes("hủy")) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px] border border-rose-500/20">
        ĐÃ HỦY
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] border border-amber-500/20">
      CHỜ TIẾP ĐÓN
    </span>
  );
}

// ─── 3. Lead Status Badge ────────────────────────────────────────────────────
export const leadStatusMap: Record<string, { label: string; badge: string }> = {
  new: { label: "Mới tiếp nhận", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" },
  contacted: { label: "Đã liên hệ", badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" },
  negotiating: { label: "Đang đàm phán", badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30" },
  won: { label: "Đã chốt hợp đồng", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
  lost: { label: "Hủy / Không mua", badge: "bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border-subtle)]" },
};

export function LeadStatusBadge({ status }: { status: string }) {
  const conf = leadStatusMap[status] || {
    label: status,
    badge: "bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border-subtle)]",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${conf.badge}`}>
      {conf.label}
    </span>
  );
}
