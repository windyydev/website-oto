"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

interface NavItem {
  name: string;
  href: string;
  path: string;
  tab?: string;
  icon: any;
  badge?: string;
  badgeType?: "live" | "count" | "alert";
}

const navigation: NavItem[] = [
  { 
    name: "Tổng quan điều hành", 
    href: "/admin",
    path: "/admin",
    icon: LayoutDashboard,
    badge: "LIVE",
    badgeType: "live"
  },
  { 
    name: "Bộ sưu tập xe", 
    href: "/admin/cars",
    path: "/admin/cars",
    icon: CarFront,
    badge: "24",
    badgeType: "count"
  },
  { 
    name: "Lịch lái thử VIP", 
    href: "/admin/leads?tab=test-drives",
    path: "/admin/leads",
    tab: "test-drives",
    icon: CalendarDays,
    badge: "Mới",
    badgeType: "alert"
  },
  { 
    name: "Kiểm định 160 điểm", 
    href: "/admin/leads?tab=inspections",
    path: "/admin/leads",
    tab: "inspections",
    icon: ShieldCheck,
  },
  { 
    name: "Khách hàng & Leads", 
    href: "/admin/leads",
    path: "/admin/leads",
    tab: undefined,
    icon: Users,
  },
  { 
    name: "Thương hiệu tuyển chọn", 
    href: "/admin/brands",
    path: "/admin/brands",
    icon: Tag,
  },
  { 
    name: "Đăng tải xe mới", 
    href: "/admin/cars/create",
    path: "/admin/cars/create",
    icon: PlusCircle,
  },
];

function AdminContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const isLoginPage = pathname === "/admin/login";
  const currentTab = searchParams?.get("tab") || undefined;

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
          1. ATELIER ADMIN SIDEBAR (Rộng 300px - w-[300px] thoáng đãng)
          ======================================================== */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 w-[300px] flex flex-col justify-between bg-[var(--surface-base)] border-r border-[var(--border-subtle)] shadow-xs select-none">
        <div className="flex flex-col gap-3">
          {/* Brand & Admin Identity */}
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-low)] border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] shadow-xs">
                <Sparkles className="w-5 h-5 text-[var(--brand-gold)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-sm tracking-[0.16em] uppercase text-[var(--text-primary)]">
                  ATELIER CURATED
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">
                  Management Cockpit
                </span>
              </div>
            </div>

            {/* Admin Profile Pill */}
            <div className="mt-5 p-3 rounded-xl bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-[var(--brand-gold)]/15 border border-[var(--brand-gold)]/30 flex items-center justify-center font-display font-bold text-xs text-[var(--brand-gold)] shrink-0">
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium text-xs text-[var(--text-primary)] truncate">
                    {user?.name || "Master Admin"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[10px] uppercase font-semibold text-[var(--brand-gold)] tracking-wider truncate">
                      {user?.role === "admin" ? "Quản trị viên" : user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-310px)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] px-3 mb-2">
              Menu Điều Hành
            </div>
            {navigation.map((item) => {
              // Phân định chính xác active state theo cả Pathname và Tab Query Param
              let isActive = false;
              if (item.path === "/admin") {
                isActive = pathname === "/admin";
              } else if (item.tab) {
                isActive = pathname === item.path && currentTab === item.tab;
              } else {
                // Với mục leads không có tab: chỉ active khi không có tab nào khác
                isActive = pathname === item.path && !currentTab;
              }

              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] font-semibold border border-[var(--brand-gold)]/30 shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[var(--brand-gold)]" : "text-[var(--text-muted)]"}`} />
                  <span className="flex-1 whitespace-nowrap">{item.name}</span>

                  {item.badge && item.badgeType === "live" && (
                    <span className="font-mono text-[9px] font-bold text-[var(--brand-gold)] bg-[var(--brand-gold)]/15 px-2 py-0.5 rounded-full tracking-wider border border-[var(--brand-gold)]/30">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && item.badgeType === "count" && (
                    <span className="font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--surface-mid)] px-2 py-0.5 rounded-md font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && item.badgeType === "alert" && (
                    <span className="font-mono text-[10px] font-semibold text-[var(--brand-gold)] bg-[var(--brand-gold)]/20 px-2 py-0.5 rounded-full border border-[var(--brand-gold)]/30">
                      {item.badge}
                    </span>
                  )}

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[var(--brand-gold)] shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--surface-base)]">
          {/* Showroom Status Indicator */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[var(--text-primary)] font-medium">Showroom Sala</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--brand-gold)] bg-[var(--brand-gold)]/10 px-2 py-0.5 rounded">08:30 - 20:30</span>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--brand-gold)] py-1.5 px-2.5 rounded-lg hover:bg-[var(--surface-low)] transition font-medium"
              title="Mở showroom công khai"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Public Showroom</span>
            </Link>

            <ThemeToggle className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. MAIN CANVAS VIEWPORT (Left offset: ml-[300px])
          ======================================================== */}
      <div className="ml-[300px] flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--surface-base)]/85 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 lg:px-10 flex items-center justify-between gap-6 shadow-xs">
          {/* Search Input Bar */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Tìm mã xe, khách hàng, mã đặt lịch #AT-TD8921..."
                className="w-full bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] transition"
              />
            </div>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Export PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-low)] text-xs font-medium text-[var(--text-primary)] transition"
              title="In hoặc xuất báo cáo PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>Báo Cáo PDF</span>
            </button>

            {/* Notification Button */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-low)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              title="Thông báo mới"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-gold)] rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-gold)] rounded-full" />
            </button>

            {/* Primary Action: Add Vehicle */}
            <Link
              href="/admin/cars/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-gold)] hover:bg-[#8A6C44] text-[#0B0C0E] text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Xe Mới</span>
            </Link>

            {/* Logout Button in Header */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-medium text-red-500 hover:text-red-400 transition cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="p-6 lg:p-10 flex-1 max-w-[1560px] w-full mx-auto">
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
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AdminContentShell>{children}</AdminContentShell>
      </Suspense>
    </AuthProvider>
  );
}
