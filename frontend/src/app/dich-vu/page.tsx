"use client";

import Link from "next/link";
import { useTestDrive } from "@/context/TestDriveContext";
import { 
  ShieldCheck, 
  BadgeCheck, 
  Banknote, 
  RefreshCw, 
  Car, 
  Sparkles, 
  ArrowRight,
  Phone,
  CheckCircle2
} from "lucide-react";
import ContactConsultSection from "@/components/sections/ContactConsultSection";

const servicesList = [
  {
    icon: ShieldCheck,
    title: "1. Thẩm Định & Kiểm Định 160 Điểm Độc Lập",
    description: "Được thực hiện bởi đội ngũ kỹ sư trưởng từng công tác tại các hãng siêu xe. Chúng tôi sử dụng thiết bị soi buồng đốt, đo vi sai khung gầm, quét cảm biến áp suất dầu và kiểm tra độ dày lớp sơn nguyên bản trên từng milimet thân vỏ.",
    benefits: [
      "Biên bản kiểm định minh bạch 160 hạng mục",
      "Xác nhận xe không đâm đụng, không ngập nước thủy kích",
      "Đo lường hao mòn các chi tiết cơ khí và điện tử",
    ],
  },
  {
    icon: BadgeCheck,
    title: "2. Ký Gửi Xe Siêu Sang & Bảo Mật Danh Tính",
    description: "Dịch vụ dành riêng cho các chủ xe bận rộn muốn thanh khoản xe nhanh chóng với mức giá cao nhất thị trường mà không phải tiếp xúc với các cuộc gọi làm phiền hay để lộ thông tin tư gia.",
    benefits: [
      "Bảo quản xe trong phòng kính điều hòa 24/7",
      "Tiếp cận mạng lưới hơn 500 nhà sưu tầm và khách VIP",
      "Bảo mật tuyệt đối thông tin cá nhân và biển số xe",
    ],
  },
  {
    icon: Banknote,
    title: "3. Giải Pháp Tài Chính & Trả Góp Cá Nhân Hóa",
    description: "Hợp tác chiến lược cùng khối khách hàng ưu tiên (Priority Banking) của các ngân hàng quốc tế và nội địa hàng đầu. Chúng tôi cung cấp các gói vay linh hoạt với lãi suất đặc quyền và thủ tục thẩm định bảo mật.",
    benefits: [
      "Hạn mức vay lên đến 75% giá trị xe",
      "Thời gian giải ngân nhanh trong 24 giờ",
      "Hỗ trợ chứng minh nguồn thu và xử lý hồ sơ tận nơi",
    ],
  },
  {
    icon: RefreshCw,
    title: "4. Thu Cũ Đổi Mới (Trade-in) Sang Trọng",
    description: "Nâng cấp trải nghiệm cơ khí của bạn một cách liền mạch. Định giá xe cũ với mức giá sát thị trường nhất và bù trừ sang các mẫu xe mới trong kho Atelier mà không làm gián đoạn việc di chuyển hàng ngày.",
    benefits: [
      "Định giá xe cũ tận nhà miễn phí",
      "Khấu hao tối thiểu khi đổi sang xe cùng phân khúc",
      "Bàn giao xe mới và nhận xe cũ cùng một thời điểm",
    ],
  },
];

export default function ServicesPage() {
  const { openModal } = useTestDrive();

  return (
    <div className="bg-[var(--bg-app)] min-h-screen text-[var(--text-primary)]">
      {/* Hero Banner */}
      <div className="bg-[#121316] text-[#FBFBFA] py-20 border-b border-[#2f3130]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
            Atelier Ecosystem
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold text-white tracking-tight">
            Đặc Quyền Dịch Vụ Khép Kín
          </h1>
          <p className="text-sm text-[#dadad9] max-w-xl font-light leading-relaxed">
            Mỗi giao dịch tại Atelier Curated Automotive không chỉ là mua bán một chiếc xe, mà là sự đồng hành lâu dài cùng trải nghiệm sưu tầm xe thượng lưu.
          </p>
        </div>
      </div>

      {/* Services List Detail */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 py-20 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {servicesList.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl p-8 space-y-6 shadow-sm hover:border-[var(--brand-gold)] transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--surface-mid)] flex items-center justify-center text-[var(--brand-gold)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-display font-semibold text-[var(--text-primary)]">
                    {srv.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                    {srv.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--brand-gold)] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => openModal()}
                    className="w-full py-2.5 bg-[var(--surface-inverted)] hover:bg-[var(--brand-gold)] text-[var(--text-inverted)] hover:text-[#121316] font-semibold text-xs uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
                  >
                    Gửi Yêu Cầu Dịch Vụ Này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      <ContactConsultSection />
    </div>
  );
}
