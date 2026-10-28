import type { Metadata } from "next";
import NewsClient from "./NewsClient";
import JsonLd, { generateBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Tin Tức & Góc Nhìn Chuyên Gia Ô Tô Thượng Lưu – Atelier Magazine",
  description: "Cập nhật góc nhìn chuyên gia về các tuyệt tác cơ khí, thị trường siêu xe và phân tích giá trị sưu tầm ô tô cao cấp.",
  keywords: ["tin tức siêu xe", "tạp chí ô tô", "góc nhìn chuyên gia", "Atelier Automotive", "sưu tầm xe"],
};

export default function NewsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Tin tức", url: "/tin-tuc" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <NewsClient />
    </>
  );
}
