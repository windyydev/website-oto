import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import JsonLd, { generateBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Đặc Quyền Dịch Vụ Siêu Xe – Kiểm Định, Ký Gửi & Tài Trợ Trả Góp",
  description: "Khám phá hệ sinh thái dịch vụ Atelier: Thẩm định 160 điểm độc lập, ký gửi bảo mật, giải pháp tài trợ trả góp cá nhân hóa và đổi cũ lấy mới.",
  keywords: ["dịch vụ siêu xe", "kiểm định xe sang", "ký gửi siêu xe", "trả góp siêu xe", "thu cũ đổi mới xe sang"],
};

export default function ServicesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Dịch vụ", url: "/dich-vu" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ServicesClient />
    </>
  );
}
