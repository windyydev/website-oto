"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Car } from "@/lib/api";

interface CompareContextType {
  compareCars: Car[];
  compareCount: number;
  isInCompare: (carId: number) => boolean;
  toggleCompare: (car: Car) => void;
  removeFromCompare: (carId: number) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType>({
  compareCars: [],
  compareCount: 0,
  isInCompare: () => false,
  toggleCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
});

const STORAGE_KEY = "atelier_compare_cars";

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareCars, setCompareCars] = useState<Car[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompareCars(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse compare cars from localStorage:", e);
    }
  }, []);

  const saveCompare = (newList: Car[]) => {
    setCompareCars(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save compare cars to localStorage:", e);
    }
  };

  const isInCompare = (carId: number) => {
    return compareCars.some((c) => c.id === carId);
  };

  const toggleCompare = (car: Car) => {
    if (isInCompare(car.id)) {
      const filtered = compareCars.filter((c) => c.id !== car.id);
      saveCompare(filtered);
      toast.info(`Đã gỡ ${car.name} khỏi so sánh`);
    } else {
      if (compareCars.length >= 3) {
        toast.warning("Chỉ có thể so sánh tối đa 3 mẫu xe cùng lúc!");
        return;
      }
      const updated = [...compareCars, car];
      saveCompare(updated);
      toast.success(`Đã thêm ${car.name} vào danh sách so sánh`, {
        action: {
          label: "So sánh ngay",
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = "/so-sanh";
          },
        },
      });
    }
  };

  const removeFromCompare = (carId: number) => {
    const filtered = compareCars.filter((c) => c.id !== carId);
    saveCompare(filtered);
  };

  const clearCompare = () => {
    saveCompare([]);
    toast.info("Đã xóa tất cả xe trong danh sách so sánh");
  };

  return (
    <CompareContext.Provider
      value={{
        compareCars,
        compareCount: compareCars.length,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
