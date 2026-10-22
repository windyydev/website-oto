import { ShieldCheck, FileCheck2, Crown, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    tag: "Tiêu chuẩn kỹ thuật",
    title: "Kiểm Định 150 Điểm Độc Lập",
    description:
      "Nội soi buồng đốt, đo độ dày nước sơn điện tử, quét cảm biến ECU và kiểm tra độ biến dạng vi mô khung gầm. Chỉ những chiếc xe đạt điểm số hoàn hảo mới được đưa vào bộ sưu tập.",
  },
  {
    icon: FileCheck2,
    tag: "Nguồn gốc minh bạch",
    title: "Lý Lịch Nguyên Bản 100%",
    description:
      "Cam kết bằng văn bản: Không tai nạn ảnh hưởng kết cấu, không ngập nước thủy kích, ODO chuẩn xác và đầy đủ lịch sử bảo dưỡng chính hãng.",
  },
  {
    icon: Crown,
    tag: "Đặc quyền thượng lưu",
    title: "Tiếp Đón & Giao Dịch Riêng Tư",
    description:
      "Không gian thưởng lãm VIP biệt lập, bảo mật tuyệt đối danh tính chủ sở hữu, dịch vụ lái thử tại tư gia và chính sách hỗ trợ ký gửi sang tên nhanh chóng.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="py-24 bg-[var(--surface-low)] border-y border-[var(--border-subtle)]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3 mb-16">
          <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
            The Atelier Standard
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
            Triết Lý Tuyển Chọn Khắt Khe
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Chúng tôi không kinh doanh số lượng. Mỗi chiếc xe tại Atelier là một tác phẩm được thẩm định bằng con mắt của những chuyên gia cơ khí hàng đầu.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] p-8 rounded-lg space-y-5 transition duration-300 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--brand-gold)]">
                      {item.tag}
                    </span>
                    <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mt-1">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--brand-gold)] font-medium">
                  <span>Tiêu chuẩn Atelier</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
