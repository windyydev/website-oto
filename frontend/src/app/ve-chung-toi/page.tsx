import Link from "next/link";
import { ShieldCheck, Award, Users, CheckCircle2, ArrowRight } from "lucide-react";
import AboutStatsSection from "@/components/sections/AboutStatsSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import TestDriveCTASection from "@/components/sections/TestDriveCTASection";

export default function AboutPage() {
  return (
    <div className="bg-[#FBFBFA] min-h-screen text-[#121316]">
      {/* Hero Header */}
      <div className="bg-[#121316] text-[#FBFBFA] py-20 border-b border-[#2f3130]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
            Our Heritage & Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold text-white tracking-tight">
            Về Atelier Curated Automotive
          </h1>
          <p className="text-sm text-[#dadad9] max-w-xl font-light leading-relaxed">
            Nơi niềm đam mê cơ khí thuần túy hội tụ cùng sự chuẩn mực và tính bảo mật tuyệt đối trong từng giao dịch xe thể thao và xe sang.
          </p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
              Câu Chuyện Thương Hiệu
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight">
              Chúng Tôi Định Nghĩa Lại Khái Niệm &quot;Xe Sang Đã Qua Sử Dụng&quot;
            </h2>
            <div className="space-y-4 text-xs text-[#66686B] leading-relaxed font-light">
              <p>
                Được thành lập bởi những nhà sưu tầm xe và chuyên gia kỹ thuật từng làm việc cho các hãng siêu xe tại châu Âu, Atelier Curated Automotive ra đời nhằm xóa bỏ mọi sự bất an và mập mờ thường thấy trên thị trường xe lướt.
              </p>
              <p>
                Tại Atelier, chúng tôi coi mỗi chiếc xe như một tác phẩm điêu khắc cơ khí có linh hồn. Chúng tôi từ chối hơn 85% số xe được chào bán để chỉ giữ lại 15% những chiếc xe có lịch sử bảo dưỡng hoàn mỹ, nước sơn nguyên bản và khung gầm chưa từng bị biến dạng dù chỉ một milimet.
              </p>
              <p>
                Khách hàng của chúng tôi là những doanh nhân thành đạt, các nghệ sĩ và những người yêu xe có gu thưởng thức tinh tế, những người đòi hỏi một chuẩn mực giao dịch kín đáo, tinh tế và văn minh.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-[#EAEAE7]">
            <img
              src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=85"
              alt="Atelier Showroom Lounge"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 text-white">
              <div>
                <span className="text-xs font-semibold text-[#9E7D53] uppercase tracking-wider block">Showroom Lounge</span>
                <p className="text-sm font-display font-semibold mt-0.5">Không gian thưởng lãm riêng tư tại Quận 1, TP. HCM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <AboutStatsSection />

      {/* The 4-Step Process */}
      <div className="py-24 bg-[#FBFBFA]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
              The 4-Step Journey
            </span>
            <h2 className="text-3xl font-display font-semibold text-[#121316]">
              Quy Trình Tuyển Chọn 4 Bước
            </h2>
            <p className="text-xs text-[#66686B]">
              Quy trình khép kín đảm bảo chất lượng xuất sắc trước khi xe xuất hiện trong phòng trưng bày.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sàng Lọc Nguồn Gốc", desc: "Tra cứu toàn diện lịch sử bảo dưỡng chính hãng, dữ liệu bảo hiểm và xác minh quyền sở hữu hợp pháp." },
              { step: "02", title: "Kiểm Định 150 Tiêu Chí", desc: "Nội soi động cơ, đo độ biến dạng khung gầm unibody và quét kiểm tra toàn bộ hệ thống điều khiển điện tử." },
              { step: "03", title: "Detailing & Phục Hồi", desc: "Vệ sinh khoang máy bằng hơi nước nóng, phủ bảo vệ Ceramic cao cấp và dưỡng da nội thất chuyên biệt." },
              { step: "04", title: "Bàn Giao & Bảo Chứng", desc: "Bàn giao xe kèm hồ sơ kiểm định vật lý, cam kết bảo hành mở rộng và gói hỗ trợ kỹ thuật 24/7." },
            ].map((p, i) => (
              <div key={i} className="p-6 bg-white border border-[#EAEAE7] rounded-xl space-y-3 shadow-sm">
                <span className="text-2xl font-mono font-bold text-[#9E7D53] block">{p.step}</span>
                <h3 className="text-base font-display font-semibold text-[#121316]">{p.title}</h3>
                <p className="text-xs text-[#66686B] leading-relaxed font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us Component */}
      <WhyUsSection />

      {/* Test Drive CTA */}
      <TestDriveCTASection />
    </div>
  );
}
