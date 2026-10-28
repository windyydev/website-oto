"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Car } from "@/lib/api";

interface WishlistContextType {
  wishlist: Car[];
  wishlistCount: number;
  isInWishlist: (carId: number) => boolean;
  toggleWishlist: (car: Car) => void;
  removeFromWishlist: (carId: number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  wishlistCount: 0,
  isInWishlist: () => false,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
});

const STORAGE_KEY = "atelier_wishlist_cars";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Car[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse wishlist from localStorage:", e);
    }
  }, []);

  const saveWishlist = (newList: Car[]) => {
    setWishlist(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage:", e);
    }
  };

  const isInWishlist = (carId: number) => {
    return wishlist.some((c) => c.id === carId);
  };

  const toggleWishlist = (car: Car) => {
    if (isInWishlist(car.id)) {
      const filtered = wishlist.filter((c) => c.id !== car.id);
      saveWishlist(filtered);
      toast.info(`Đã bỏ ${car.name} khỏi danh sách yêu thích`);
    } else {
      const updated = [car, ...wishlist.filter((c) => c.id !== car.id)];
      saveWishlist(updated);
      toast.success(`Đã thêm ${car.name} vào danh sách yêu thích!`, {
        action: {
          label: "Xem danh sách",
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = "/yeu-thich";
          },
        },
      });
    }
  };

  const removeFromWishlist = (carId: number) => {
    const car = wishlist.find((c) => c.id === carId);
    const filtered = wishlist.filter((c) => c.id !== carId);
    saveWishlist(filtered);
    if (car) {
      toast.info(`Đã bỏ ${car.name} khỏi danh sách yêu thích`);
    }
  };

  const clearWishlist = () => {
    saveWishlist([]);
    toast.info("Đã làm trống danh sách xe yêu thích");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
