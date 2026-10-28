import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from "lucide-react";
import ContactConsultSection from "@/components/sections/ContactConsultSection";

export const metadata: Metadata = {
  title: "Liên Hệ & Đặt Lịch Tiếp Đón Riêng Tư – Atelier Showroom",
  description: "Thông tin liên hệ, hotline 24/7 và đặt lịch trải nghiệm riêng tư tại không gian trưng bày Atelier Curated Automotive.",
};

export default function ContactPage() {
  return (
    <div className="bg-[var(--bg-app)] min-h-screen text-[var(--text-primary)]">
      {/* Hero Banner */}
      <div className="bg-[var(--surface-base)] text-[var(--text-primary)] py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
            Visit Our Atelier
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
            Liên Hệ & Đặt Lịch Tiếp Đón
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl font-light leading-relaxed">
            Chúng tôi hân hạnh đón tiếp quý khách tại không gian thưởng lãm biệt lập tại trung tâm Quận 1, TP. Hồ Chí Minh.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded bg-[var(--surface-low)] flex items-center justify-center text-[var(--brand-gold)]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">
              Phòng Trưng Bày Trung Tâm
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Số 18 Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh. Có bãi đậu xe riêng an ninh 24/7.
            </p>
          </div>

          <div className="p-8 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded bg-[var(--surface-low)] flex items-center justify-center text-[var(--brand-gold)]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">
              Hotline Concierge 24/7
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Hỗ trợ tư vấn đặt lịch lái thử, ký gửi xe và thẩm định giá: <strong className="text-[var(--text-primary)]">0908 123 456</strong>
            </p>
          </div>

          <div className="p-8 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded bg-[var(--surface-low)] flex items-center justify-center text-[var(--brand-gold)]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">
              Khung Giờ Tiếp Khách VIP
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
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
