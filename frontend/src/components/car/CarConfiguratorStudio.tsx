"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Car, CarColor, CarOption } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { 
  Check, 
  Sparkles, 
  Sliders, 
  Palette, 
  Layers, 
  Share2, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface CarConfiguratorStudioProps {
  car: Car;
  onOpenTestDriveModal: (configData?: {
    carId: number;
    carName: string;
    atelierCode: string;
    totalPrice: number;
    colorName: string;
    optionsCount: number;
  }) => void;
  onSelectColorChange?: (color: CarColor) => void;
}

export function CarConfiguratorStudio({
  car,
  onOpenTestDriveModal,
  onSelectColorChange,
}: CarConfiguratorStudioProps) {
  // 1. Quản lý Màu sắc đã chọn
  const colors = car.colors || [];
  const defaultColor = colors.find((c) => c.is_default) || colors[0] || null;
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(defaultColor);

  useEffect(() => {
    if (colors.length > 0 && (!selectedColor || !colors.some(c => c.id === selectedColor.id))) {
      const def = colors.find((c) => c.is_default) || colors[0];
      setSelectedColor(def);
    }
  }, [colors, selectedColor]);

  // 2. Quản lý Options đã chọn (Set of option IDs)
  const initialSelectedOptionIds = useMemo(() => {
    const ids = new Set<number>();
    (car.options || []).forEach((opt) => {
      if (opt.is_selected || opt.is_standard) {
        ids.add(opt.id);
      }
    });
    return ids;
  }, [car.options]);

  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<number>>(initialSelectedOptionIds);

  useEffect(() => {
    setSelectedOptionIds(new Set(initialSelectedOptionIds));
  }, [initialSelectedOptionIds]);

  // 3. Quản lý Tab nhóm Option đang xem
  const optionGroups = useMemo(() => {
    const groups: { [key: string]: CarOption[] } = {};
    (car.options || []).forEach((opt) => {
      if (!groups[opt.group]) {
        groups[opt.group] = [];
      }
      groups[opt.group].push(opt);
    });
    return groups;
  }, [car.options]);

  const groupKeys = Object.keys(optionGroups);
  const [activeGroup, setActiveGroup] = useState<string>(groupKeys[0] || "Tất cả");

  // 4. Tính toán tổng giá theo thời gian thực
  const pricingBreakdown = useMemo(() => {
    const basePrice = car.price || 0;
    const colorPrice = selectedColor ? selectedColor.price_delta || 0 : 0;
    
    let optionsPrice = 0;
    let selectedCount = 0;
    (car.options || []).forEach((opt) => {
      if (selectedOptionIds.has(opt.id)) {
        if (!opt.is_standard) {
          optionsPrice += opt.price;
        }
        selectedCount++;
      }
    });

    const totalPrice = basePrice + colorPrice + optionsPrice;
    return {
      basePrice,
      colorPrice,
      optionsPrice,
      selectedCount,
      totalPrice,
    };
  }, [car.price, car.options, selectedColor, selectedOptionIds]);

  // Sinh mã Atelier Code duy nhất đại diện cho bản dựng này
  const atelierCode = useMemo(() => {
    const carPrefix = car.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
    const colorCode = selectedColor ? selectedColor.id.toString(16).toUpperCase() : "0";
    const optsHash = Array.from(selectedOptionIds).slice(0, 3).join("");
    return `ATL-${carPrefix || "CAR"}-${colorCode}${optsHash || "00"}`;
  }, [car.name, selectedColor, selectedOptionIds]);

  // Xử lý đổi màu
  const handleColorClick = (color: CarColor) => {
    setSelectedColor(color);
    onSelectColorChange?.(color);
  };

  // Xử lý bật/tắt option
  const handleToggleOption = (opt: CarOption) => {
    if (opt.is_standard) return; // Option tiêu chuẩn không cho bỏ
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(opt.id)) {
        next.delete(opt.id);
      } else {
        next.add(opt.id);
      }
      return next;
    });
  };

  // Reset về cấu hình gốc
  const handleResetConfig = () => {
    setSelectedColor(defaultColor);
    if (defaultColor) onSelectColorChange?.(defaultColor);
    setSelectedOptionIds(new Set(initialSelectedOptionIds));
  };

  // Gửi cấu hình sang Modal Đặt Lịch
  const handleConsultSubmit = () => {
    onOpenTestDriveModal({
      carId: car.id,
      carName: car.name,
      atelierCode,
      totalPrice: pricingBreakdown.totalPrice,
      colorName: selectedColor?.name || car.exterior_color || "Tiêu chuẩn",
      optionsCount: pricingBreakdown.selectedCount,
    });
  };

  return (
    <section className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-6 lg:p-8 space-y-8 shadow-sm">
      {/* Header Studio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-gold)] uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Atelier Bespoke Configurator</span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] mt-1">
            Studio Tự Phối Cấu Hình Độc Bản
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
            Tùy biến bảng màu sơn ngoại thất, chọn các gói mâm xe, phanh gốm và trang bị nội thất. Giá xe tự động cập nhật theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetConfig}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Đặt lại cấu hình mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thiết lập lại</span>
          </button>
        </div>
      </div>

      {/* Main 2-Col Grid: Left Swatches & Options, Right Sticky Live Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Color Swatches & Options Tabs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. BẢNG MÀU SƠN NGOẠI THẤT */}
          {colors.length > 0 && (
            <div className="space-y-4 p-5 bg-[var(--surface-low)] rounded-xl border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--brand-gold)]" />
                  <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Màu Sơn Ngoại Thất (Exterior Palette)
                  </span>
                </div>
                {selectedColor && (
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    Đã chọn: <strong className="text-[var(--brand-gold)]">{selectedColor.name}</strong>{" "}
                    {selectedColor.price_delta > 0 ? (
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        (+{formatPrice(selectedColor.price_delta)})
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-500 font-medium">(Màu tiêu chuẩn)</span>
                    )}
                  </span>
                )}
              </div>

              {/* Swatch List */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {colors.map((color) => {
                  const isSelected = selectedColor?.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorClick(color)}
                      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--surface-base)] border-[var(--brand-gold)] shadow-md ring-2 ring-[var(--brand-gold)]/40"
                          : "bg-[var(--surface-base)]/60 hover:bg-[var(--surface-base)] border-[var(--border-subtle)] hover:border-[var(--brand-gold)]/50"
                      }`}
                      title={`${color.name} - ${color.price_delta > 0 ? "+" + formatPrice(color.price_delta) : "Tiêu chuẩn"}`}
                    >
                      {/* Color Circle */}
                      <span
                        className="w-6 h-6 rounded-full border border-black/20 shadow-inner shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.hex_code }}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${color.hex_code.toLowerCase() === "#d2d1cd" || color.hex_code.toLowerCase() === "#f5d033" ? "text-black" : "text-white"}`} />
                        )}
                      </span>

                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium text-[var(--text-primary)] line-clamp-1">
                          {color.name.split("(")[0]}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {color.price_delta > 0 ? `+${formatPrice(color.price_delta)}` : "0 đ"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. BẢNG TRANG BỊ OPTIONS THEO NHÓM */}
          {groupKeys.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--brand-gold)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Trang Bị Tùy Chọn & Gói Nâng Cấp (Equipment Packages)
                </span>
              </div>

              {/* Group Category Nav Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {groupKeys.map((group) => {
                  const isActive = activeGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setActiveGroup(group)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? "bg-[var(--surface-low)] text-[var(--brand-gold)] font-semibold border border-[var(--brand-gold)]/40 shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] border border-transparent"
                      }`}
                    >
                      {group} ({optionGroups[group].length})
                    </button>
                  );
                })}
              </div>

              {/* Options Checklist in Active Group */}
              <div className="space-y-3">
                {(optionGroups[activeGroup] || []).map((opt) => {
                  const isChecked = selectedOptionIds.has(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleOption(opt)}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                        isChecked
                          ? "bg-[var(--surface-low)] border-[var(--brand-gold)]/60 shadow-xs"
                          : "bg-[var(--surface-base)] hover:bg-[var(--surface-low)]/60 border-[var(--border-subtle)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition ${
                            isChecked
                              ? "bg-[var(--brand-gold)] border-[var(--brand-gold)] text-black"
                              : "border-[var(--border-subtle)] bg-[var(--surface-base)]"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {opt.code && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-[var(--brand-gold)] border border-[var(--border-subtle)]">
                                {opt.code}
                              </span>
                            )}
                            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                              {opt.name}
                            </h4>
                            {opt.is_standard && (
                              <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Tiêu chuẩn
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-[var(--text-primary)] block">
                          {opt.is_standard || opt.price === 0 ? "0 đ" : `+${formatPrice(opt.price)}`}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {isChecked ? "Đã bao gồm" : "Chưa chọn"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Live Price Calculator & Atelier Code Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <div className="p-6 bg-[var(--surface-low)] rounded-2xl border border-[var(--border-subtle)] space-y-6 shadow-sm">
            
            {/* Atelier Unique Code Banner */}
            <div className="p-3 bg-[var(--surface-base)] rounded-xl border border-[var(--brand-gold)]/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-semibold text-[var(--brand-gold)] uppercase tracking-wider block">
                  MÃ CẤU HÌNH ĐỘC BẢN
                </span>
                <span className="font-mono font-bold text-sm text-[var(--text-primary)] mt-0.5 block">
                  {atelierCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(atelierCode);
                  alert(`Đã sao chép mã cấu hình: ${atelierCode}`);
                }}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                title="Sao chép mã cấu hình"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Price Line-item Breakdown */}
            <div className="space-y-3 pt-2 text-xs border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Giá niêm yết tiêu chuẩn:</span>
                <span className="font-mono text-[var(--text-primary)] font-medium">
                  {formatPrice(pricingBreakdown.basePrice)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="truncate max-w-[170px]">
                  Màu sơn ({selectedColor ? selectedColor.name.split("(")[0] : "Cơ bản"}):
                </span>
                <span className="font-mono text-[var(--text-primary)] font-medium">
                  {pricingBreakdown.colorPrice > 0 ? `+${formatPrice(pricingBreakdown.colorPrice)}` : "0 đ"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Trang bị tùy chọn ({pricingBreakdown.selectedCount}):</span>
                <span className="font-mono text-[var(--text-primary)] font-medium">
                  {pricingBreakdown.optionsPrice > 0 ? `+${formatPrice(pricingBreakdown.optionsPrice)}` : "0 đ"}
                </span>
              </div>
            </div>

            {/* Total Estimated Price */}
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                TỔNG GIÁ TRỊ CẤU HÌNH DỰ KIẾN
              </span>
              <div className="text-2xl font-display font-bold text-[var(--brand-gold)] mt-1">
                {formatPrice(pricingBreakdown.totalPrice)}
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                (Đã bao gồm thuế & đặc quyền bảo dưỡng Atelier)
              </span>
            </div>

            {/* Action CTA */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConsultSubmit}
                className="w-full py-3.5 bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#0B0C0E]" />
                <span>Đặt Xe Theo Cấu Hình Này</span>
              </button>

              <p className="text-[11px] text-[var(--text-muted)] text-center font-light leading-relaxed pt-1">
                Chuyên viên Atelier Concierge sẽ sử dụng mã <strong className="font-mono text-[var(--brand-gold)]">{atelierCode}</strong> để đặt hàng trực tiếp từ nhà máy hoặc kiểm tra xe lướt tương thích.
              </p>
            </div>

            {/* Guarantees */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2 text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-gold)] shrink-0" />
                <span>Cam kết linh kiện chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-gold)] shrink-0" />
                <span>Hỗ trợ chứng minh nguồn gốc hải quan</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default CarConfiguratorStudio;
