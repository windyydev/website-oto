import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng giá tiền chuẩn thị trường ô tô Việt Nam (tỷ / triệu VNĐ)
 */
export function formatPrice(price: number): string {
  if (!price || isNaN(price)) return "Liên hệ";
  if (price >= 1_000_000_000) {
    const ty = (price / 1_000_000_000).toFixed(2);
    // Bỏ số 0 thừa sau dấu phẩy nếu có (ví dụ 1.50 -> 1.5, 2.00 -> 2)
    return `${parseFloat(ty)} tỷ`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} triệu`;
  }
  return `${price.toLocaleString("vi-VN")} đ`;
}

/**
 * Định dạng số Km ODO
 */
export function formatOdo(km: number): string {
  if (km === undefined || km === null || isNaN(km)) return "0 km";
  return `${km.toLocaleString("vi-VN")} km`;
}

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành URL slug thân thiện
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
