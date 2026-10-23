import React from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import { Brand, Category } from "@/lib/api";
import CategoryTreeFilter from "@/components/car/CategoryTreeFilter";

interface FilterPanelProps {
  search: string;
  setSearch: (v: string) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (v: string) => void;
  categories?: Category[];
  selectedBodyType: string;
  setSelectedBodyType: (v: string) => void;
  brands: Brand[];
  applyFilters: (overrides?: any) => void;
  handleResetFilters: () => void;
  onApplyClose?: () => void;
}

export function FilterPanel({
  search,
  setSearch,
  selectedBrand,
  setSelectedBrand,
  selectedCategory = "",
  setSelectedCategory,
  categories = [],
  selectedBodyType,
  setSelectedBodyType,
  brands,
  applyFilters,
  handleResetFilters,
  onApplyClose,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--brand-gold)]" />
          Bộ Lọc Tiêu Chí
        </span>
        <button
          onClick={handleResetFilters}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--brand-gold)] flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Thiết lập lại
        </button>
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-primary)]">
          Tìm kiếm theo từ khóa
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="VD: GT3, AMG, M4..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
          />
        </div>
      </div>

      {/* Category Tree Filter (Phân khúc & Dòng xe) */}
      {categories && categories.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <CategoryTreeFilter
            categories={categories}
            selectedCategoryId={selectedCategory ? Number(selectedCategory) : null}
            onSelectCategory={(cat) => {
              const nextId = cat ? String(cat.id) : "";
              setSelectedCategory?.(nextId);
              applyFilters({ category: nextId });
            }}
          />
        </div>
      )}

      {/* Brand Filter */}
      <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
        <label className="text-xs font-semibold text-[var(--text-primary)]">Thương hiệu</label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => {
              setSelectedBrand("");
              applyFilters({ brand: "" });
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs transition flex items-center justify-between min-h-[36px] cursor-pointer ${
              selectedBrand === ""
                ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-medium"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-low)]"
            }`}
          >
            <span>Tất cả thương hiệu</span>
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                const next = selectedBrand === String(b.id) ? "" : String(b.id);
                setSelectedBrand(next);
                applyFilters({ brand: next });
              }}
              className={`w-full text-left px-3 py-2 rounded text-xs transition flex items-center justify-between min-h-[36px] cursor-pointer ${
                selectedBrand === String(b.id)
                  ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-low)]"
              }`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body Type Filter */}
      <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
        <label className="text-xs font-semibold text-[var(--text-primary)]">Kiểu dáng thân xe</label>
        <div className="grid grid-cols-2 gap-2">
          {["Sedan", "SUV", "MPV", "Bán tải", "Crossover", "Hatchback"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                const next = selectedBodyType === type ? "" : type;
                setSelectedBodyType(next);
                applyFilters({ body: next });
              }}
              className={`py-2 px-2 rounded text-xs text-center border transition min-h-[38px] cursor-pointer ${
                selectedBodyType === type
                  ? "bg-[var(--brand-gold)] border-[var(--brand-gold)] text-black font-semibold shadow-xs"
                  : "bg-[var(--surface-low)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-gold)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          applyFilters();
          onApplyClose?.();
        }}
        className="w-full py-3 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs uppercase tracking-wider rounded transition cursor-pointer"
      >
        Áp Dụng Bộ Lọc
      </button>
    </div>
  );
}

export default FilterPanel;
