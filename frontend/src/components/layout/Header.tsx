"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTestDrive } from "@/context/TestDriveContext";
import { Menu, X, ArrowUpRight, Sparkles, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navLinks = [
  { name: "Trang chủ", href: "/" },
  { name: "Bộ sưu tập xe", href: "/xe" },
  { name: "Dịch vụ", href: "/dich-vu" },
  { name: "Về chúng tôi", href: "/ve-chung-toi" },
  { name: "Tin tức", href: "/tin-tuc" },
  { name: "Liên hệ", href: "/lien-he" },
];

export default function Header() {
  const pathname = usePathname();
  const { openModal } = useTestDrive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If inside /admin route, don't show public header
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-[1480px] mx-auto px-5 lg:px-12 h-16 md:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded bg-[var(--brand-primary)] flex items-center justify-center text-[var(--text-inverted)] shadow-sm transition group-hover:scale-105">
              <span className="font-display font-bold text-sm tracking-tighter">A</span>
            </div>
            <div>
              <span className="font-display font-semibold text-base tracking-wider uppercase text-[var(--text-primary)] block">
                Atelier
              </span>
              <span className="text-[10px] text-[var(--brand-gold)] font-medium tracking-[0.2em] block uppercase">
                Curated Automotive
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    isActive
                      ? "text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-gold)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:0908123456"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition px-3 py-2"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>0908 123 456</span>
            </a>

            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] text-xs font-semibold uppercase tracking-wider rounded transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Đặt Lịch Lái Thử</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0B0C0E]" />
            </button>

            <ThemeToggle />

            <Link
              href="/admin"
              className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition"
            >
              Admin
            </Link>
          </div>

          {/* Mobile right: phone icon + quick CTA + hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <a
              href="tel:0908123456"
              className="p-2.5 text-[var(--brand-gold)] hover:bg-[var(--surface-low)] rounded-full transition"
              aria-label="Gọi điện"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => openModal()}
              className="px-3 py-1.5 bg-[var(--brand-primary)] text-[var(--text-inverted)] text-[11px] font-semibold uppercase rounded tracking-wider"
            >
              Lái Thử
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-primary)] hover:bg-[var(--surface-low)] rounded transition flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Sheet — slides from top, below sticky header */}
      <div
        className={`fixed top-16 left-0 right-0 z-[35] md:hidden bg-[var(--bg-app)] border-b border-[var(--border-subtle)] shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-5 py-5 space-y-2 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {/* Nav Links */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition min-h-[52px] ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-[var(--text-inverted)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--surface-low)]"
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)]" />}
                </Link>
              );
            })}
          </nav>

          {/* CTAs */}
          <div className="border-t border-[var(--border-subtle)] pt-4 pb-2 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal();
              }}
              className="w-full py-3.5 bg-[var(--brand-primary)] text-[var(--text-inverted)] text-sm font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 min-h-[52px]"
            >
              <Sparkles className="w-4 h-4 text-[var(--brand-gold)]" />
              Đặt Lịch Lái Thử
            </button>
            <a
              href="tel:0908123456"
              className="w-full py-3.5 bg-[var(--surface-low)] text-[var(--text-primary)] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 min-h-[52px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone className="w-4 h-4 text-[var(--brand-gold)]" />
              0908 123 456
            </a>
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Giao diện (Dark/Light):</span>
              <ThemeToggle />
            </div>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center min-h-[44px]"
            >
              Quản Trị Hệ Thống (Admin)
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
