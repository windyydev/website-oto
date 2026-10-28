import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import JsonLd, { generateBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Bảng So Sánh Thông Số Xe – Atelier Curated Automotive",
  description: "Đối chiếu trực quan thông số vận hành, mức giá, trang bị và tiêu chuẩn kiểm định 150 điểm giữa 2-3 mẫu siêu xe trong showroom.",
};

export default function ComparePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Bộ sưu tập xe", url: "/xe" },
    { name: "So sánh xe", url: "/so-sanh" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <CompareClient />
    </>
  );
}
