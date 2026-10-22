"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { adminApi, Car } from "@/lib/api";
import CarCard from "@/components/car/CarCard";

export default function FeaturedCarsSection() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getCars({ page_size: 4 })
      .then((res) => {
        setCars(res.items || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[var(--bg-app)]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[var(--border-subtle)]">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
              Curated Selection
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
              Tuyệt Tác Nổi Bật Trong Tuần
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-lg">
              Những mẫu xe thể thao và sedan hiệu năng cao hiếm có vừa hoàn tất quy trình kiểm định 150 điểm và sẵn sàng bàn giao.
            </p>
          </div>

          <Link
            href="/xe"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition group shrink-0"
          >
            <span>Khám phá toàn bộ kho xe</span>
            <ArrowRight className="w-4 h-4 text-[var(--brand-gold)] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cars.length === 0 ? (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">
            Hiện tại các xe nổi bật đang được cập nhật. Vui lòng quay lại sau!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
