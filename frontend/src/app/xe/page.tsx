import type { Metadata } from "next";
import CarCollectionClient from "./CarCollectionClient";
import JsonLd, { generateBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Siêu Xe & Xe Thể Thao Cao Cấp – Atelier Curated",
  description: "Khám phá danh mục siêu xe, xe thể thao và xe sang lướt nguyên bản đạt chuẩn kiểm định 150 điểm độc lập tại Atelier Curated Automotive.",
  keywords: ["bộ sưu tập xe", "siêu xe", "xe thể thao", "xe sang", "Porsche", "Ferrari", "McLaren", "Mercedes-AMG", "Atelier"],
};

export default function CarCollectionPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Bộ sưu tập xe", url: "/xe" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <CarCollectionClient />
    </>
  );
}
