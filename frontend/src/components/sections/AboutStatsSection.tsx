
const stats = [
  { value: "150+", label: "Hạng mục kiểm định khắt khe", sub: "Nội soi cơ khí độc lập" },
  { value: "100%", label: "Lý lịch nguyên bản minh bạch", sub: "Không thủy kích, không đâm đụng" },
  { value: "24 Th", label: "Cam kết bảo hành mở rộng", sub: "Đồng hành toàn quốc" },
  { value: "24/7", label: "Chuyên viên Concierge riêng biệt", sub: "Hỗ trợ thủ tục tận nhà" },
];

export default function AboutStatsSection() {
  return (
    <section className="py-20 bg-[#121316] text-[#FBFBFA] border-b border-[#2f3130]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#2f3130]">
          {stats.map((item, idx) => (
            <div key={idx} className={`space-y-2 ${idx !== 0 ? "pt-6 lg:pt-0 lg:pl-8" : ""}`}>
              <div className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
                {item.value}
              </div>
              <p className="text-sm font-semibold text-[#9E7D53] leading-snug">
                {item.label}
              </p>
              <p className="text-xs text-[#dadad9] font-light">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
