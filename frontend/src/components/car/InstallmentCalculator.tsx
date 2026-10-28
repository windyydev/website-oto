"use client";

import React, { useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { Calculator, Banknote, ShieldAlert, ArrowRight, HelpCircle } from "lucide-react";
import { useTestDrive } from "@/context/TestDriveContext";

interface InstallmentCalculatorProps {
  carPrice?: number;
  carName?: string;
}

export default function InstallmentCalculator({
  carPrice = 3_500_000_000,
  carName,
}: InstallmentCalculatorProps) {
  const { openModal } = useTestDrive();
  const [price, setPrice] = useState<number>(carPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // 30%
  const [tenureMonths, setTenureMonths] = useState<number>(60); // 5 năm
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%/năm

  // Synchronize when carPrice prop changes
  React.useEffect(() => {
    if (carPrice) setPrice(carPrice);
  }, [carPrice]);

  const calculations = useMemo(() => {
    const downPaymentAmount = (price * downPaymentPercent) / 100;
    const loanAmount = Math.max(0, price - downPaymentAmount);
    const monthlyInterestRate = interestRate / 100 / 12;

    // Fixed monthly principal
    const monthlyPrincipal = tenureMonths > 0 ? loanAmount / tenureMonths : 0;
    // Estimated first month interest
    const firstMonthInterest = loanAmount * monthlyInterestRate;
    // Estimated first month payment (principal + interest)
    const estimatedMonthlyPayment = monthlyPrincipal + firstMonthInterest;

    // Total estimated interest paid over the period (declining balance approximation)
    const totalInterest = ((loanAmount * (tenureMonths + 1)) / 2) * monthlyInterestRate;
    const totalPayment = price + totalInterest;

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPrincipal,
      firstMonthInterest,
      estimatedMonthlyPayment,
      totalInterest,
      totalPayment,
    };
  }, [price, downPaymentPercent, tenureMonths, interestRate]);

  return (
    <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[var(--brand-gold)]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--brand-gold)]">
              Financial Concierge
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-display font-semibold text-[var(--text-primary)] mt-1">
            Bảng Tính Trả Góp Ước Tính {carName ? `– ${carName}` : ""}
          </h3>
        </div>
        <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-low)] px-3 py-1.5 rounded border border-[var(--border-subtle)]">
          Lãi suất ưu đãi từ <strong className="text-[var(--brand-gold)] font-semibold">{interestRate}%/năm</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Controls Column */}
        <div className="space-y-5">
          {/* Down Payment % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Tỷ lệ trả trước:</span>
              <span className="font-semibold text-[var(--text-primary)] font-mono">
                {downPaymentPercent}% ({formatPrice(calculations.downPaymentAmount)})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[20, 30, 40, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-2 rounded text-xs font-medium transition cursor-pointer ${
                    downPaymentPercent === pct
                      ? "bg-[var(--brand-gold)] text-[#0B0C0E] font-bold"
                      : "bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Thời hạn vay:</span>
              <span className="font-semibold text-[var(--text-primary)] font-mono">
                {tenureMonths} tháng ({(tenureMonths / 12).toFixed(1)} năm)
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {[12, 24, 36, 48, 60, 72].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setTenureMonths(months)}
                  className={`py-2 rounded text-xs font-medium transition cursor-pointer ${
                    tenureMonths === months
                      ? "bg-[var(--brand-gold)] text-[#0B0C0E] font-bold"
                      : "bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {months} th
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Lãi suất năm:</span>
              <span className="font-semibold text-[var(--brand-gold)] font-mono">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={6}
              max={12}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-[var(--brand-gold)] h-1.5 bg-[var(--surface-mid)] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>6.0% (Gói VIP)</span>
              <span>8.5% (Tiêu chuẩn)</span>
              <span>12.0%</span>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-5">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider block">
              Ước tính tháng đầu tiên (Gốc + Lãi)
            </span>
            <div className="text-2xl md:text-3xl font-display font-bold text-[var(--brand-gold)] mt-1">
              ~{formatPrice(calculations.estimatedMonthlyPayment)}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ tháng</span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="divide-y divide-[var(--border-subtle)] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Giá xe niêm yết:</span>
              <span className="font-mono font-medium text-[var(--text-primary)]">{formatPrice(price)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Số tiền cần trả trước:</span>
              <span className="font-mono font-semibold text-emerald-500">
                {formatPrice(calculations.downPaymentAmount)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Số tiền ngân hàng giải ngân:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {formatPrice(calculations.loanAmount)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Gốc trả hàng tháng:</span>
              <span className="font-mono text-[var(--text-secondary)]">
                {formatPrice(calculations.monthlyPrincipal)}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Lãi tháng đầu ước tính:</span>
              <span className="font-mono text-[var(--text-secondary)]">
                {formatPrice(calculations.firstMonthInterest)}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() =>
              openModal({
                id: 0,
                name: carName ? `Tư vấn trả góp: ${carName}` : "Tư vấn gói vay tài chính",
              })
            }
            className="w-full py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-gold)] text-[var(--text-inverted)] hover:text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Banknote className="w-4 h-4" />
            <span>Tư Vấn Hồ Sơ Vay Ưu Đãi</span>
          </button>

          <p className="text-[10px] text-[var(--text-muted)] leading-normal flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
            <span>Bảng tính mang tính tham khảo theo dư nợ giảm dần. Lãi suất và hạn mức chính xác phụ thuộc vào ngân hàng liên kết và hồ sơ tín dụng của quý khách.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
