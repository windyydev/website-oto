import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AdminKpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  trendBadge?: React.ReactNode;
  trendLabel?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
}

export function AdminKpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendBadge,
  trendLabel,
  footerLeft,
  footerRight,
}: AdminKpiCardProps) {
  return (
    <div className="bg-[var(--surface-base)] p-5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-colors flex flex-col justify-between shadow-xs">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
          <Icon className="w-4 h-4 text-[var(--brand-gold)]" />
        </div>
      </div>

      <div className="mt-4">
        <div className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </div>
        {(trend || trendBadge || trendLabel) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[11px] font-medium ${
                  trend.isPositive !== false
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                }`}
              >
                {trend.isPositive !== false ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
            {trendBadge}
            {trendLabel && <span className="text-xs text-[var(--text-muted)]">{trendLabel}</span>}
          </div>
        )}
      </div>

      {(footerLeft || footerRight) && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          {footerLeft && <span className="text-[var(--text-primary)] font-medium">{footerLeft}</span>}
          {footerRight && (
            <span className="text-[var(--brand-gold)] text-[11px] font-semibold uppercase">
              {footerRight}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminKpiCard;
