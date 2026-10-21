import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from "lucide-react";
import ContactConsultSection from "@/components/sections/ContactConsultSection";

export default function ContactPage() {
  return (
    <div className="bg-[#FBFBFA] min-h-screen text-[#121316]">
      {/* Hero Banner */}
      <div className="bg-[#121316] text-[#FBFBFA] py-20 border-b border-[#2f3130]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
            Visit Our Atelier
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold text-white tracking-tight">
            Liên Hệ & Đặt Lịch Tiếp Đón
          </h1>
          <p className="text-sm text-[#dadad9] max-w-xl font-light leading-relaxed">
            Chúng tôi hân hạnh đón tiếp quý khách tại không gian thưởng lãm biệt lập tại trung tâm Quận 1, TP. Hồ Chí Minh.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-[#EAEAE7] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#F4F4F2] flex items-center justify-center text-[#9E7D53]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[#121316]">
              Phòng Trưng Bày Trung Tâm
            </h3>
            <p className="text-xs text-[#66686B] leading-relaxed">
              Số 18 Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh. Có bãi đậu xe riêng an ninh 24/7.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#EAEAE7] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#F4F4F2] flex items-center justify-center text-[#9E7D53]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[#121316]">
              Hotline Concierge 24/7
            </h3>
            <p className="text-xs text-[#66686B] leading-relaxed">
              Hỗ trợ tư vấn đặt lịch lái thử, ký gửi xe và thẩm định giá: <strong className="text-[#121316]">0908 123 456</strong>
            </p>
          </div>

          <div className="p-8 bg-white border border-[#EAEAE7] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#F4F4F2] flex items-center justify-center text-[#9E7D53]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[#121316]">
              Khung Giờ Tiếp Khách VIP
            </h3>
            <p className="text-xs text-[#66686B] leading-relaxed">
              Thứ Hai - Chủ Nhật: 08:30 - 20:00. Vui lòng đặt hẹn trước để được phục vụ phòng tiếp khách riêng biệt.
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Form Component */}
      <ContactConsultSection />
    </div>
  );
}
