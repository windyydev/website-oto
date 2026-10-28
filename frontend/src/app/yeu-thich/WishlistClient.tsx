"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import CarCard from "@/components/car/CarCard";
import { Heart, ChevronRight, ArrowRight, Trash2, Sparkles, CarFront } from "lucide-react";

export default function WishlistClient() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();

  return (
    <div className="bg-[var(--bg-app)] min-h-screen pb-24 text-[var(--text-primary)]">
      {/* Breadcrumb Bar */}
      <div className="bg-[var(--surface-low)] border-b border-[var(--border-subtle)] py-4">
        <div className="max-w-[1480px] mx-auto px-5 lg:px-12 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--text-primary)] transition">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
            <span className="text-[var(--text-primary)] font-medium">Xe đã lưu yêu thích</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[var(--brand-gold)] font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{wishlistCount} mẫu xe đã lưu</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-5 lg:px-12 pt-8 md:pt-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-xs font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block mb-1">
              Personal Curated Collection
            </span>
            <h1 className="text-2xl md:text-4xl font-display font-semibold tracking-tight text-[var(--text-primary)]">
              Danh Sách Xe Yêu Thích
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl font-light">
              Nơi lưu trữ những kiệt tác ô tô quý khách quan tâm. Dữ liệu được đồng bộ trực tiếp trên trình duyệt của quý khách.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-medium text-[var(--text-secondary)] hover:text-rose-500 transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
              <Link
                href="/xe"
                className="px-4 py-2.5 rounded-lg bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] transition flex items-center gap-2"
              >
                <span>Khám phá thêm xe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistCount === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Heart className="w-8 h-8 opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-display font-semibold text-[var(--text-primary)]">
                Chưa có mẫu xe nào được lưu
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Nhấn vào biểu tượng trái tim (♥) trên bất kỳ chiếc xe nào trong showroom để lưu lại và theo dõi dễ dàng.
              </p>
            </div>
            <Link
              href="/xe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] font-semibold text-xs uppercase tracking-wider transition shadow-sm"
            >
              <CarFront className="w-4 h-4" />
              <span>Khám Phá Bộ Sưu Tập Xe</span>
            </Link>
          </div>
        ) : (
          <div className="pt-8 space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Concierge Banner */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-[var(--surface-base)] to-[var(--surface-low)] border border-[var(--brand-gold)]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                  VIP Concierge Service
                </span>
                <h4 className="text-lg font-display font-semibold text-[var(--text-primary)]">
                  Quý khách muốn trải nghiệm lái thử những mẫu xe đã chọn?
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-light">
                  Chuyên viên quản lý trải nghiệm riêng của Atelier sẵn sàng mang xe đến tận nhà quý khách.
                </p>
              </div>

              <a
                href="tel:0908123456"
                className="px-6 py-3.5 bg-[var(--brand-primary)] text-[var(--text-inverted)] hover:bg-[var(--brand-gold)] hover:text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition shrink-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[var(--brand-gold)]" />
                <span>Gọi Hotline VIP: 0908 123 456</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
