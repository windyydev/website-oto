import React from "react";

interface AdminPageHeaderProps {
  breadcrumbs: {
    category?: string;
    subCategory?: string;
  };
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  breadcrumbs,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">
          <span>{breadcrumbs.category || "BẢNG ĐIỀU KHIỂN"}</span>
          {breadcrumbs.subCategory && (
            <>
              <span>•</span>
              <span className="text-[var(--brand-gold)]">{breadcrumbs.subCategory}</span>
            </>
          )}
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export default AdminPageHeader;
