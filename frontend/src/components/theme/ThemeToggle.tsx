"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Đổi giao diện"
        className={`w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] opacity-50 ${className}`}
        disabled
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`group relative w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-low)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 focus:outline-none ${className}`}
      title={isDark ? "Chuyển sang giao diện Sáng (Light Mode)" : "Chuyển sang giao diện Tối (Dark Mode)"}
      aria-label="Đổi giao diện Dark/Light Mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#D4AF37] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-primary)] transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
