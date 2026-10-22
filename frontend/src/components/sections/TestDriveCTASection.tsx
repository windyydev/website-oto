"use client";

import { useTestDrive } from "@/context/TestDriveContext";
import { ArrowUpRight, Phone, Sparkles } from "lucide-react";

export default function TestDriveCTASection() {
  const { openModal } = useTestDrive();

  return (
    <section className="relative py-24 bg-[#121316] text-[#FBFBFA] overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
          alt="CTA background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121316] via-[#121316]/90 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#9E7D53]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trải Nghiệm Thực Tế Đỉnh Cao</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            Cảm Nhận Từng Nhịp Đập <br />
            Của Cỗ Máy Bạn Khao Khát.
          </h2>

          <p className="text-sm text-[#dadad9] leading-relaxed max-w-lg">
            Đừng chỉ ngắm nhìn qua màn hình. Hãy ngồi vào ghế lái, khởi động nút Start/Stop và lắng nghe âm thanh ống xả nguyên bản. 
            Atelier sẵn sàng đưa xe đến tận tư gia hoặc đón tiếp bạn tại phòng chờ VIP.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => openModal()}
              className="px-8 py-3.5 bg-[#9E7D53] hover:bg-[#9E7D53]/90 text-[#121316] font-semibold text-xs uppercase tracking-wider rounded transition shadow-lg flex items-center gap-2"
            >
              <span>Đăng Ký Lái Thử Ngay</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href="tel:0908123456"
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#9E7D53]" />
              <span>Hotline 24/7: 0908 123 456</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
