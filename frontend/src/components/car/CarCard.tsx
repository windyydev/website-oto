"use client";

import Link from "next/link";
import { useTestDrive } from "@/context/TestDriveContext";
import { Gauge, Fuel, Calendar, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Car } from "@/lib/api";

export function formatPrice(price: number) {
  if (price >= 1_000_000_000) {
    const b = price / 1_000_000_000;
    return `${b % 1 === 0 ? b : b.toFixed(2)} tỷ`;
  }
  return `${(price / 1_000_000).toFixed(0)} triệu`;
}

export default function CarCard({ car }: { car: Car }) {
  const { openModal } = useTestDrive();

  const primaryImage =
    car.images?.find((img) => img.is_primary)?.image_url ||
    car.images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group bg-[#FFFFFF] border border-[#EAEAE7] hover:border-[#9E7D53] rounded-lg overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-md">
      {/* Image Frame */}
      <Link href={`/xe/${car.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[#F4F4F2]">
        <img
          src={primaryImage}
          alt={car.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        {car.badge ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#121316]/90 backdrop-blur-md text-[10px] font-semibold tracking-wider text-[#9E7D53] uppercase border border-[#9E7D53]/30">
            {car.badge}
          </span>
        ) : car.condition === "new" ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#121316]/90 backdrop-blur-md text-[10px] font-semibold tracking-wider text-emerald-400 uppercase border border-emerald-500/30">
            Xe Mới 100%
          </span>
        ) : null}

        {/* Inspection Verified Stamp */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-[10px] font-medium text-[#121316] flex items-center gap-1 border border-[#EAEAE7]">
          <ShieldCheck className="w-3 h-3 text-[#9E7D53]" />
          Kiểm định 150 điểm
        </span>
      </Link>

      {/* Car Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#66686B] uppercase tracking-wider">
            <span>{car.year}</span>
            <span>•</span>
            <span>{car.body_type}</span>
            <span>•</span>
            <span>{car.drivetrain}</span>
          </div>

          <Link href={`/xe/${car.slug}`}>
            <h3 className="font-display font-semibold text-base text-[#121316] group-hover:text-[#9E7D53] transition mt-1 line-clamp-1">
              {car.name}
            </h3>
          </Link>

          {/* Quick Specs Icons */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EAEAE7] text-xs text-[#66686B]">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#9E7D53]" />
              <span>{car.odo_km.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#9E7D53]" />
              <span className="truncate">{car.fuel_type}</span>
            </div>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="pt-3 border-t border-[#EAEAE7] flex items-center justify-between">
          <div>
            <div className="text-lg font-display font-bold text-[#121316]">
              {formatPrice(car.price)}
            </div>
            {car.monthly_installment && (
              <div className="text-[11px] text-[#66686B]">
                ~{(car.monthly_installment / 1_000_000).toFixed(0)} tr/tháng
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal({ id: car.id, name: car.name })}
              className="px-3 py-1.5 text-xs font-semibold text-[#121316] bg-[#F4F4F2] hover:bg-[#EAEAE7] rounded transition"
              title="Đặt lịch lái thử xe này"
            >
              Lái Thử
            </button>
            <Link
              href={`/xe/${car.slug}`}
              className="p-2 bg-[#121316] hover:bg-[#9E7D53] text-white rounded transition"
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
