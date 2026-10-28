"use client";

import Link from "next/link";
import { useTestDrive } from "@/context/TestDriveContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { Gauge, Fuel, Calendar, ArrowUpRight, ShieldCheck, Heart, Scale } from "lucide-react";
import { Car } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export { formatPrice };

export default function CarCard({ car }: { car: Car }) {
  const { openModal } = useTestDrive();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const isLiked = isInWishlist(car.id);
  const isCompared = isInCompare(car.id);

  const primaryImage =
    car.images?.find((img) => img.is_primary)?.image_url ||
    car.images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] rounded-lg overflow-hidden transition-all duration-300 flex flex-col shadow-xs hover:shadow-md relative">
      {/* Image Frame */}
      <div className="relative block aspect-[16/10] overflow-hidden bg-[var(--surface-low)]">
        <Link href={`/xe/${car.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={car.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top-Right Action Buttons: Compare & Wishlist */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(car);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              isCompared
                ? "bg-[var(--brand-gold)] text-[#0B0C0E]"
                : "bg-black/60 text-white/80 hover:bg-black/80 hover:text-white"
            }`}
            title={isCompared ? "Đang so sánh (bấm để bỏ)" : "Thêm vào so sánh"}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(car);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              isLiked
                ? "bg-rose-500 text-white"
                : "bg-black/60 text-white/80 hover:bg-black/80 hover:text-rose-400"
            }`}
            title={isLiked ? "Đã lưu yêu thích (bấm để bỏ)" : "Lưu vào yêu thích"}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Badge */}
        {car.badge ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold tracking-wider text-[var(--brand-gold)] uppercase border border-[var(--brand-gold)]/40">
            {car.badge}
          </span>
        ) : car.condition === "new" ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold tracking-wider text-emerald-400 uppercase border border-emerald-500/40">
            Xe Mới 100%
          </span>
        ) : null}

        {/* Inspection Verified Stamp */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[var(--surface-base)]/90 backdrop-blur-md text-[10px] font-medium text-[var(--text-primary)] flex items-center gap-1 border border-[var(--border-subtle)]">
          <ShieldCheck className="w-3 h-3 text-[var(--brand-gold)]" />
          Kiểm định 150 điểm
        </span>
      </div>

      {/* Car Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
            <span>{car.year}</span>
            <span>•</span>
            <span>{car.body_type}</span>
            <span>•</span>
            <span>{car.drivetrain}</span>
          </div>

          <Link href={`/xe/${car.slug}`}>
            <h3 className="font-display font-semibold text-base text-[var(--text-primary)] group-hover:text-[var(--brand-gold)] transition mt-1 line-clamp-1">
              {car.name}
            </h3>
          </Link>

          {/* Quick Specs Icons */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span>{car.odo_km.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              <span className="truncate">{car.fuel_type}</span>
            </div>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-lg font-display font-bold text-[var(--text-primary)]">
              {formatPrice(car.price)}
            </div>
            {car.monthly_installment && (
              <div className="text-[11px] text-[var(--text-muted)]">
                ~{(car.monthly_installment / 1_000_000).toFixed(0)} tr/tháng
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal({ id: car.id, name: car.name })}
              className="px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded transition"
              title="Đặt lịch lái thử xe này"
            >
              Lái Thử
            </button>
            <Link
              href={`/xe/${car.slug}`}
              className="p-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-gold)] text-[var(--text-inverted)] hover:text-black rounded transition"
              title="Xem chi tiết"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
