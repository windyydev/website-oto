import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      className={`py-16 px-6 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)] shadow-xs">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminEmptyState;
