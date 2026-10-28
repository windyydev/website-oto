"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { useTestDrive } from "@/context/TestDriveContext";
import { adminApi, Car } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { 
  Scale, 
  ChevronRight, 
  X, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Trash2,
  CarFront
} from "lucide-react";

export default function CompareClient() {
  const { compareCars, compareCount, removeFromCompare, clearCompare, toggleCompare } = useCompare();
  const { openModal } = useTestDrive();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    adminApi.getCars({ page_size: 50 }).then((res) => {
      setAllCars(res.items || []);
    }).catch(console.error);
  }, []);

  const availableCarsToAdd = allCars.filter(
    (c) => !compareCars.some((comp) => comp.id === c.id)
  );

  return (
    <div className="bg-[var(--bg-app)] min-h-screen pb-24 text-[var(--text-primary)]">
      {/* Breadcrumb Bar */}
      <div className="bg-[var(--surface-low)] border-b border-[var(--border-subtle)] py-4">
        <div className="max-w-[1480px] mx-auto px-5 lg:px-12 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--text-primary)] transition">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
            <Link href="/xe" className="hover:text-[var(--text-primary)] transition">Bộ sưu tập</Link>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
            <span className="text-[var(--text-primary)] font-medium">Đối chiếu & So sánh xe</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[var(--brand-gold)] font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>{compareCount}/3 mẫu xe đang chọn</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-5 lg:px-12 pt-8 md:pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-xs font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block mb-1">
              Side-by-Side Evaluation
            </span>
            <h1 className="text-2xl md:text-4xl font-display font-semibold tracking-tight text-[var(--text-primary)]">
              Bảng So Sánh Thông Số Xe
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl font-light">
              Đối chiếu trực quan thông số vận hành, mức giá, trang bị và tiêu chuẩn kiểm định giữa các mẫu xe trong bộ sưu tập Atelier.
            </p>
          </div>

          {compareCount > 0 && (
            <div className="flex items-center gap-3">
              {compareCount < 3 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-[var(--brand-gold)] text-[#0B0C0E] hover:opacity-90 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm xe so sánh</span>
                </button>
              )}
              <button
                onClick={clearCompare}
                className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-low)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bảng</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {compareCount === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Scale className="w-8 h-8 opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-display font-semibold text-[var(--text-primary)]">
                Chưa có mẫu xe nào để so sánh
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Quý khách có thể chọn nút so sánh (icon cân đo) trên thẻ từng xe tại bộ sưu tập hoặc bấm nút bên dưới để chọn nhanh.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] font-semibold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Chọn Xe So Sánh Ngay</span>
            </button>
          </div>
        ) : (
          <div className="pt-8 overflow-x-auto">
            <div className="min-w-[700px] border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--surface-base)] shadow-xs">
              {/* Header Cars Grid */}
              <div className="grid grid-cols-4 divide-x divide-[var(--border-subtle)] border-b border-[var(--border-subtle)] bg-[var(--surface-low)]">
                <div className="p-5 flex flex-col justify-end">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Tiêu chí đối chiếu
                  </span>
                </div>

                {[0, 1, 2].map((idx) => {
                  const car = compareCars[idx];
                  if (!car) {
                    return (
                      <div key={idx} className="p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                        <div className="w-12 h-12 rounded-full border border-dashed border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">Thêm xe thứ {idx + 1}</span>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-3 py-1.5 rounded text-[11px] font-medium bg-[var(--surface-mid)] hover:bg-[var(--brand-gold)] hover:text-black transition"
                        >
                          Chọn xe
                        </button>
                      </div>
                    );
                  }

                  const img = car.images?.[0]?.image_url || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";

                  return (
                    <div key={car.id} className="p-5 flex flex-col justify-between space-y-3 relative group">
                      <button
                        onClick={() => removeFromCompare(car.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition"
                        title="Bỏ so sánh"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[var(--surface-base)] border border-[var(--border-subtle)]">
                        <img src={img} alt={car.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--brand-gold)] font-semibold uppercase tracking-wider block">
                          {car.brand?.name || "Automotive"}
                        </span>
                        <Link href={`/xe/${car.slug}`}>
                          <h4 className="font-display font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition line-clamp-1">
                            {car.name}
                          </h4>
                        </Link>
                        <div className="text-base font-display font-bold text-[var(--text-primary)] pt-1">
                          {formatPrice(car.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => openModal({ id: car.id, name: car.name })}
                        className="w-full py-2 bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] font-semibold text-[11px] uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#0B0C0E]" />
                        <span>Lái Thử</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div className="divide-y divide-[var(--border-subtle)] text-xs">
                {[
                  { label: "Năm sản xuất", render: (c: Car) => `${c.year}` },
                  { label: "Số Km đã chạy (ODO)", render: (c: Car) => `${c.odo_km?.toLocaleString()} km` },
                  { label: "Kiểu dáng", render: (c: Car) => c.body_type || "N/A" },
                  { label: "Hộp số", render: (c: Car) => c.transmission || "N/A" },
                  { label: "Nhiên liệu", render: (c: Car) => c.fuel_type || "N/A" },
                  { label: "Hệ dẫn động", render: (c: Car) => c.drivetrain || "N/A" },
                  { label: "Màu ngoại thất", render: (c: Car) => c.exterior_color || "Chưa rõ" },
                  { label: "Màu nội thất", render: (c: Car) => c.interior || "Chưa rõ" },
                  { label: "Tình trạng xe", render: (c: Car) => c.condition === "new" ? "Xe mới 100%" : "Đã qua sử dụng (Lướt)" },
                  { label: "Số đời chủ", render: (c: Car) => c.owners_count === 0 ? "Chưa đăng ký" : `${c.owners_count} chủ` },
                  {
                    label: "Bảo hành chính hãng",
                    render: (c: Car) => (
                      <span className={c.has_factory_warranty ? "text-emerald-500 font-medium" : "text-[var(--text-muted)]"}>
                        {c.has_factory_warranty ? `Còn ${c.warranty_months} tháng` : "Đã hết hạn"}
                      </span>
                    ),
                  },
                  {
                    label: "Kiểm định 150 điểm",
                    render: () => (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>150/150 Đạt</span>
                      </span>
                    ),
                  },
                  {
                    label: "Ước tính trả góp",
                    render: (c: Car) => c.monthly_installment ? `~${(c.monthly_installment / 1_000_000).toFixed(0)} triệu / tháng` : "Liên hệ",
                  },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-4 divide-x divide-[var(--border-subtle)] hover:bg-[var(--surface-low)]/50 transition">
                    <div className="p-3.5 font-medium text-[var(--text-muted)] bg-[var(--surface-low)]/30 flex items-center">
                      {row.label}
                    </div>
                    {[0, 1, 2].map((idx) => {
                      const car = compareCars[idx];
                      return (
                        <div key={idx} className="p-3.5 font-mono text-[var(--text-primary)] flex items-center">
                          {car ? row.render(car) : <span className="text-[var(--text-muted)]">—</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Quick Pick Car To Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">
                  Chọn Xe Để So Sánh
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Chỉ hiển thị các mẫu xe chưa có trong bảng so sánh
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-[var(--surface-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-[var(--border-subtle)]">
              {availableCarsToAdd.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  Tất cả các xe đã được thêm vào bảng so sánh
                </div>
              ) : (
                availableCarsToAdd.map((car) => {
                  const img = car.images?.[0]?.image_url || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80";
                  return (
                    <div key={car.id} className="pt-2 pb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={img} alt={car.name} className="w-14 h-10 object-cover rounded bg-[var(--surface-low)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{car.name}</p>
                          <span className="text-[11px] text-[var(--brand-gold)] font-mono">{formatPrice(car.price)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toggleCompare(car);
                          setShowAddModal(false);
                        }}
                        className="px-3 py-1.5 rounded bg-[var(--brand-primary)] text-[var(--text-inverted)] hover:bg-[var(--brand-gold)] hover:text-black text-xs font-medium transition shrink-0"
                      >
                        Thêm vào so sánh
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
