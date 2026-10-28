import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";
import JsonLd, { generateBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Danh Sách Xe Yêu Thích – Atelier Curated Automotive",
  description: "Bộ sưu tập những mẫu siêu xe và xe sang quý khách đã lưu trữ. Đặt lịch lái thử riêng tư tại nhà hoặc nhận tư vấn từ giám đốc thẩm định.",
};

export default function WishlistPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Xe yêu thích", url: "/yeu-thich" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <WishlistClient />
    </>
  );
}
