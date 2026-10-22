"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CarFront, 
  PlusCircle, 
  Users, 
  Tag, 
  CalendarDays,
  ShieldCheck,
  ExternalLink,
  Search,
  Bell,
  FileDown,
  Sparkles,
  ChevronRight,
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const navigation = [
  { 
    name: "Tổng quan", 
    href: "/admin", 
    icon: LayoutDashboard,
    badge: "LIVE",
    badgeType: "live"
  },
  { 
    name: "Quản lý Bộ sưu tập xe", 
    href: "/admin/cars", 
    icon: CarFront,
    badge: "24",
    badgeType: "count"
  },
  { 
    name: "Lịch lái thử & Concierge", 
    href: "/admin/leads?tab=test-drives", 
    icon: CalendarDays,
    badge: "8 mới",
    badgeType: "alert"
  },
  { 
    name: "Thẩm định 160 Điểm", 
    href: "/admin/leads?tab=inspections", 
    icon: ShieldCheck,
  },
  { 
    name: "Khách hàng & Tư vấn viên", 
    href: "/admin/leads", 
    icon: Users,
  },
  { 
    name: "Thương hiệu & Phân hạng", 
    href: "/admin/brands", 
    icon: Tag,
  },
  { 
    name: "Đăng tải Xe mới", 
    href: "/admin/cars/create", 
    icon: PlusCircle,
  },
];

function AdminContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  // Redirect sang /admin/login nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  // Nếu là trang login, render trực tiếp không có sidebar/topbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Màn hình loading bảo mật trong khi xác thực token
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center gap-4 text-[var(--text-primary)]">
        <div className="w-10 h-10 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-display font-semibold tracking-wide">ATELIER SECURITY</p>
          <p className="text-xs text-[var(--text-secondary)]">Đang kiểm tra quyền truy cập quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ========================================================
          1. ATELIER ADMIN SIDEBAR
          ======================================================== */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 w-72 flex flex-col justify-between bg-[var(--surface-base)] border-r border-[var(--border-subtle)] select-none">
        <div className="flex flex-col gap-4">
          {/* Brand & Admin Identity */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)] shadow-sm">
                <Sparkles className="w-5 h-5 text-[var(--brand-gold)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-base tracking-widest uppercase text-[var(--text-primary)]">
                  ATELIER XE
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium tracking-wider">
                  Hệ thống Quản trị Atelier
                </span>
              </div>
            </div>

            {/* Admin Profile Pill */}
            <div className="mt-4 p-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-gold)]/20 border border-[var(--brand-gold)]/40 flex items-center justify-center font-display font-bold text-xs text-[var(--brand-gold)] shrink-0">
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium text-xs text-[var(--text-primary)] truncate">
                    {user?.name || "Master Admin"}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[var(--brand-gold)] tracking-wider">
                    {user?.role === "admin" ? "Quản trị viên Atelier" : user?.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 rounded hover:bg-[var(--surface-mid)] text-[var(--text-muted)] hover:text-red-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
              Menu Quản Trị
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href.split("?")[0];
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--surface-mid)] text-[var(--text-primary)] font-semibold border-l-2 border-[var(--brand-gold)] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[var(--brand-gold)]" : "text-[var(--text-muted)]"}`} />
                  <span className="flex-1 truncate">{item.name}</span>

                  {item.badge && item.badgeType === "live" && (
                    <span className="font-sans text-[9px] font-bold text-[var(--brand-gold)] bg-[var(--brand-gold)]/10 px-1.5 py-0.5 rounded tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && item.badgeType === "count" && (
                    <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-mid)] px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && item.badgeType === "alert" && (
                    <span className="font-mono text-[10px] font-semibold text-[var(--brand-gold)] bg-[var(--brand-gold)]/20 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[var(--brand-gold)] ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 bg-[var(--surface-base)]">
          {/* Showroom Status Indicator */}
          <div className="px-3 py-2 rounded-lg bg-[var(--surface-low)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">Showroom Sala</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">T2 - CN</span>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5 px-2 rounded hover:bg-[var(--surface-low)] transition"
              title="Mở showroom công khai"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Public Web</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle className="w-8 h-8" />
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 py-1.5 px-2 rounded hover:bg-red-950/20 transition cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. MAIN CANVAS VIEWPORT
          ======================================================== */}
      <div className="ml-72 flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--surface-base)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Search Input Bar */}
          <div className="flex items-center gap-4 w-72 md:w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Tìm mã xe, biển số, mã đặt lịch #AT-TD8921..."
                className="w-full bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition-colors"
              />
            </div>
          </div>

          {/* Center Showroom Status (Desktop) */}
          <div className="hidden xl:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-[var(--surface-low)] rounded-lg border border-[var(--border-subtle)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[var(--text-primary)] font-medium">Trạng thái Atelier: Mở cửa (08:30 - 20:30)</span>
            </div>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Button */}
            <button
              type="button"
              className="relative p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-low)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              title="Thông báo mới"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand-gold)] text-[var(--text-inverted)] font-mono text-[9px] rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </button>

            {/* Quick Export PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-low)] text-xs font-medium text-[var(--text-primary)] transition"
              title="In hoặc xuất báo cáo PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Xuất PDF</span>
            </button>

            {/* Primary Action: Add Vehicle */}
            <Link
              href="/admin/cars/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thêm xe mới</span>
            </Link>

            {/* Logout Button in Header */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-red-950/20 text-xs font-medium text-red-400 hover:text-red-300 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="p-6 lg:p-8 flex-1 max-w-[1520px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminContentShell>{children}</AdminContentShell>
    </AuthProvider>
  );
}
