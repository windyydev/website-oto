"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Check, 
  Sparkles,
  CarFront
} from "lucide-react";
import { Category } from "@/lib/api";

interface CategoryTreeFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (cat: Category | null) => void;
  className?: string;
}

interface TreeNodeProps {
  category: Category;
  selectedId: number | null;
  onSelect: (cat: Category | null) => void;
  depth?: number;
}

function TreeNode({ category, selectedId, onSelect, depth = 0 }: TreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  // Auto-expand if this node or any child is selected
  const hasSelectedChild = (node: Category): boolean => {
    if (node.id === selectedId) return true;
    if (node.children) {
      return node.children.some(hasSelectedChild);
    }
    return false;
  };

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return depth === 0 || hasSelectedChild(category);
  });

  const indentStyle = {
    paddingLeft: `${Math.max(8, depth * 14 + 10)}px`,
  };

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs transition cursor-pointer ${
          isSelected
            ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-low)] hover:text-[var(--text-primary)]"
        }`}
        style={indentStyle}
      >
        <button
          type="button"
          onClick={() => onSelect(isSelected ? null : category)}
          className="flex-1 text-left flex items-center gap-2 py-0.5 truncate"
        >
          {depth === 0 && (
            <Layers className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[var(--brand-gold)]" : "text-[var(--brand-gold)] opacity-80"}`} />
          )}
          {depth === 1 && (
            <CarFront className={`w-3 h-3 shrink-0 ${isSelected ? "text-[var(--brand-gold)]" : "text-[var(--text-muted)]"}`} />
          )}
          {depth >= 2 && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-[var(--brand-gold)]" : "bg-[var(--text-muted)] opacity-50"}`} />
          )}
          <span className="truncate">{category.name}</span>
        </button>

        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {category.cars_count !== undefined && category.cars_count > 0 && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-[var(--surface-mid)] text-[var(--text-muted)]"
              }`}
            >
              {category.cars_count}
            </span>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition ${
                isSelected ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5 mt-0.5 relative before:absolute before:left-[18px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--border-subtle)]">
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className = "",
}: CategoryTreeFilterProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
          <span>Cây Phân Khúc & Dòng Xe</span>
        </label>
        {selectedCategoryId && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-[10px] text-[var(--brand-gold)] hover:underline cursor-pointer"
          >
            Tất cả
          </button>
        )}
      </div>

      {/* All vehicles root option */}
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between min-h-[34px] cursor-pointer ${
          selectedCategoryId === null
            ? "bg-[var(--brand-primary)] text-[var(--text-inverted)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-low)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
          <span>Tất Cả Phân Khúc Xe</span>
        </div>
        {selectedCategoryId === null && (
          <Check className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
        )}
      </button>

      {/* Tree items */}
      <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
        {categories.map((cat) => (
          <TreeNode
            key={cat.id}
            category={cat}
            selectedId={selectedCategoryId}
            onSelect={onSelectCategory}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
