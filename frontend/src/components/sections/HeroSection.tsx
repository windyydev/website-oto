"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTestDrive } from "@/context/TestDriveContext";
import { Search, ArrowRight, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { adminApi, Brand } from "@/lib/api";

export default function HeroSection() {
  const router = useRouter();
  const { openModal } = useTestDrive();
  const [brands, setBrands] = useState<Brand[]>([]);

  // Search state
  const [brandId, setBrandId] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bodyType, setBodyType] = useState("");

  useEffect(() => {
    adminApi.getBrands().then((data) => setBrands(data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brandId) params.set("brand_id", brandId);
    if (bodyType) params.set("body_type", bodyType);
    if (priceRange) {
      if (priceRange === "under_5b") params.set("max_price", "5000000000");
      if (priceRange === "5b_10b") {
        params.set("min_price", "5000000000");
        params.set("max_price", "10000000000");
      }
      if (priceRange === "10b_20b") {
        params.set("min_price", "10000000000");
        params.set("max_price", "20000000000");
      }
      if (priceRange === "above_20b") params.set("min_price", "20000000000");
    }
    router.push(`/xe?${params.toString()}`);
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-between bg-[#121316] text-[#FBFBFA] overflow-hidden pt-12 pb-16">
      {/* Background Hero Image with subtle overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2000&q=85"
          alt="Hero Luxury Supercar"
          className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/50 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#121316]/80" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 lg:px-12 w-full pt-12 lg:pt-20">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#9E7D53] font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#9E7D53]" />
            <span>Atelier Curated Automotive • Tuyển Chọn Độc Bản</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white leading-[1.12]">
            Những Cỗ Máy Cơ Khí <br className="hidden sm:block" />
            <span className="italic font-normal text-[#e2e2e6]">Chuẩn Mực & Nguyên Bản</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#dadad9] max-w-xl leading-relaxed font-light">
            Không gian trưng bày dành cho giới mộ điệu và những nhà sưu tầm thượng lưu.
            Mỗi chiếc xe đều vượt qua bài kiểm định 150 điểm khắt khe, minh bạch 100% lịch sử và sẵn sàng bàn giao.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/xe"
              className="px-6 py-3.5 bg-[#FBFBFA] hover:bg-[#FBFBFA]/90 text-[#121316] font-semibold text-xs uppercase tracking-wider rounded transition shadow-lg flex items-center gap-2"
            >
              <span>Xem Toàn Bộ Kho Xe</span>
              <ArrowRight className="w-4 h-4 text-[#9E7D53]" />
            </Link>

            <button
              onClick={() => openModal()}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs uppercase tracking-wider rounded backdrop-blur-md transition"
            >
              Đặt Lịch Lái Thử Riêng Tư
            </button>
          </div>
        </div>
      </div>

      {/* Floating Quick Search Bar */}
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 lg:px-12 w-full mt-16">
        <form
          onSubmit={handleSearch}
          className="bg-[#1b1b1f]/95 border border-[#2f3130] backdrop-blur-xl p-4 sm:p-5 rounded-xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        >
          {/* Hãng xe */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D53] block">
              Thương Hiệu
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full bg-[#121316] border border-[#2f3130] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9E7D53]"
            >
              <option value="">Tất cả hãng xe</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Khoảng giá */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D53] block">
              Khoảng Giá
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-[#121316] border border-[#2f3130] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9E7D53]"
            >
              <option value="">Tất cả mức giá</option>
              <option value="under_5b">Dưới 5 tỷ VNĐ</option>
              <option value="5b_10b">Từ 5 tỷ - 10 tỷ VNĐ</option>
              <option value="10b_20b">Từ 10 tỷ - 20 tỷ VNĐ</option>
              <option value="above_20b">Trên 20 tỷ VNĐ</option>
            </select>
          </div>

          {/* Kiểu dáng */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D53] block">
              Kiểu Dáng Thân Xe
            </label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full bg-[#121316] border border-[#2f3130] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9E7D53]"
            >
              <option value="">Tất cả kiểu dáng</option>
              <option value="Coupe">Coupe Thể Thao</option>
              <option value="SUV">SUV Đô Thị & Địa Hình</option>
              <option value="Sedan">Sedan Sang Trọng</option>
              <option value="Convertible">Mui Trần (Convertible)</option>
            </select>
          </div>

          {/* Nút tìm kiếm */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              className="w-full h-10 bg-[#9E7D53] hover:bg-[#9E7D53]/90 text-[#121316] font-semibold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Kiếm Xe</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
