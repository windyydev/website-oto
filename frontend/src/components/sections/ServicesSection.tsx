import Link from "next/link";
import { BadgeCheck, ArrowRight, Banknote, ShieldAlert, RefreshCw, Car } from "lucide-react";

const services = [
  {
    icon: BadgeCheck,
    title: "Thẩm Định Giá Độc Lập",
    description: "Đánh giá chính xác giá trị xe dựa trên thuật toán thị trường và biên bản kiểm định 150 điểm thực tế.",
    href: "/dich-vu",
  },
  {
    icon: ShieldAlert,
    title: "Ký Gửi Bảo Mật Danh Tính",
    description: "Dành riêng cho khách hàng thượng lưu có nhu cầu chuyển nhượng xe kín đáo, không để lộ thông tin tư gia.",
    href: "/dich-vu",
  },
  {
    icon: Banknote,
    title: "Tài Chính & Trả Góp Linh Hoạt",
    description: "Hợp tác độc quyền cùng khối ngân hàng tư nhân. Hạn mức lên đến 75%, giải ngân thần tốc trong 24 giờ.",
    href: "/dich-vu",
  },
  {
    icon: RefreshCw,
    title: "Thu Cũ Đổi Mới Liền Mạch",
    description: "Đổi ngang hoặc nâng cấp đời xe thể thao sang trọng với mức khấu hao tối thiểu và thủ tục một điểm chạm.",
    href: "/dich-vu",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-24 bg-[#FBFBFA]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#EAEAE7]">
          <div>
            <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
              Bespoke Services
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight mt-1">
              Hệ Sinh Thái Dịch Vụ Khép Kín
            </h2>
          </div>
          <Link
            href="/dich-vu"
            className="text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#9E7D53] transition flex items-center gap-1.5"
          >
            <span>Tìm hiểu tất cả dịch vụ</span>
            <ArrowRight className="w-4 h-4 text-[#9E7D53]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-[#FFFFFF] border border-[#EAEAE7] hover:border-[#9E7D53] rounded-lg space-y-4 transition duration-300 flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded bg-[#F4F4F2] flex items-center justify-center text-[#9E7D53] group-hover:bg-[#121316] group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-semibold text-[#121316]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#66686B] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.href}
                  className="pt-4 border-t border-[#EAEAE7] text-xs font-medium text-[#9E7D53] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
