"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CarFront, 
  PlusCircle, 
  Users, 
  Tag, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";

const navigation = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Danh sách xe", href: "/admin/cars", icon: CarFront },
  { name: "Thêm xe mới", href: "/admin/cars/create", icon: PlusCircle },
  { name: "Khách hàng & Lái thử", href: "/admin/leads", icon: Users },
  { name: "Thương hiệu", href: "/admin/brands", icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/60 backdrop-blur-xl flex flex-col fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5 text-zinc-950" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider uppercase text-white block">
              AutoShowroom
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium tracking-widest block uppercase">
              Management Portal
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Quản trị hệ thống
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-black" : "text-zinc-400"}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-black" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Public site link */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              Xem trang Showroom
            </span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Public</span>
          </Link>

          <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-400 border border-zinc-700">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Admin Quản Trị</p>
              <p className="text-[10px] text-zinc-500 truncate">admin@showroom.vn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-amber-400 font-medium capitalize">
              {navigation.find((n) => n.href === pathname)?.name || "Bảng điều khiển"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hệ thống trực tuyến
            </span>
          </div>
        </header>

        {/* Page Container */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
