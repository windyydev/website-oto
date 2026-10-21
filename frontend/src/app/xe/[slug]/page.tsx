"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useTestDrive } from "@/context/TestDriveContext";
import { 
  ShieldCheck, 
  ChevronRight, 
  Gauge, 
  Calendar, 
  Fuel, 
  Award, 
  Phone, 
  Mail, 
  Clock, 
  Share2, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { api, adminApi, Car } from "@/lib/api";
import CarCard, { formatPrice } from "@/components/car/CarCard";

export default function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { openModal } = useTestDrive();

  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Touch/swipe state for gallery
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCarData();
  }, [slug]);

  const fetchCarData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cars/${slug}`);
      setCar(res.data);

      // Fetch similar cars
      const similarRes = await adminApi.getCars({ page_size: 4 });
      setSimilarCars((similarRes.items || []).filter((c: Car) => c.slug !== slug).slice(0, 3));
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        notFound();
      }
    } finally {
      setLoading(false);
    }
  };

  // Swipe navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left → next
        setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
      } else {
        // swipe right → prev
        setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumbnail = thumbnailsRef.current.children[activeImageIndex] as HTMLElement;
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeImageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center gap-3 bg-[#FBFBFA]">
        <div className="w-8 h-8 border-2 border-[#9E7D53] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#66686B]">Đang tải hồ sơ kỹ thuật xe...</span>
      </div>
    );
  }

  if (!car) {
    return notFound();
  }

  const allImages = car.images && car.images.length > 0
    ? car.images
    : [{ id: 0, image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85", category: "exterior", sort_order: 0, is_primary: true }];

  const filteredImages = activeCategory === "all"
    ? allImages
    : allImages.filter((img) => img.category === activeCategory);

  const displayImages = filteredImages.length > 0 ? filteredImages : allImages;
  const currentImage = displayImages[activeImageIndex] || displayImages[0];

  return (
    <div className="bg-[#FBFBFA] min-h-screen pb-28 md:pb-24 text-[#121316]">
      {/* Breadcrumb Bar */}
      <div className="bg-[#F4F4F2] border-b border-[#EAEAE7] py-4">
        <div className="max-w-[1480px] mx-auto px-5 lg:px-12 flex items-center justify-between text-xs text-[#66686B]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link href="/" className="hover:text-[#121316] transition shrink-0">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-[#E2E2DF] shrink-0" />
            <Link href="/xe" className="hover:text-[#121316] transition shrink-0">Bộ sưu tập</Link>
            <ChevronRight className="w-3 h-3 text-[#E2E2DF] shrink-0" />
            <span className="text-[#121316] font-medium truncate">{car.name}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#9E7D53] font-semibold uppercase tracking-wider shrink-0 ml-4">
            <span>Mã kho: {car.stock_code || `#${car.id}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-5 lg:px-12 pt-6 md:pt-8">
        {/* Car Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-5 border-b border-[#EAEAE7]">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {car.badge && (
                <span className="px-2.5 py-0.5 rounded bg-[#121316] text-[#9E7D53] text-[10px] font-semibold uppercase tracking-wider">
                  {car.badge}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-[#F4F4F2] border border-[#EAEAE7] text-[10px] font-medium text-[#66686B] uppercase">
                {car.condition === "new" ? "Xe mới 100%" : "Đã qua sử dụng"}
              </span>
              <span className="text-xs text-[#66686B]">Năm sản xuất: {car.year}</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight">
              {car.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: car.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Đã sao chép link xe vào bộ nhớ tạm!");
                }
              }}
              className="p-2.5 border border-[#EAEAE7] hover:border-[#9E7D53] rounded text-[#66686B] hover:text-[#121316] transition text-xs flex items-center gap-1.5 min-h-[40px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* 2-Columns Layout: Left Gallery & Details, Right Sticky Pricing & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-6 md:pt-8 items-start">
          {/* Left Column (2 Cols wide) */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            {/* Gallery Section */}
            <div className="space-y-3">
              {/* Category Filter Tabs - horizontal scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-hide">
                {[
                  { id: "all", label: "Tất cả ảnh" },
                  { id: "exterior", label: "Ngoại thất" },
                  { id: "interior", label: "Nội thất" },
                  { id: "dashboard", label: "Vô lăng & Taplo" },
                  { id: "wheels", label: "Mâm & Lốp" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setActiveImageIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 min-h-[32px] ${
                      activeCategory === tab.id
                        ? "bg-[#121316] text-white"
                        : "bg-[#F4F4F2] text-[#66686B] hover:text-[#121316]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Active Image Viewport with touch swipe */}
              <div
                className="relative aspect-[16/10] bg-[#121316] rounded-xl overflow-hidden border border-[#EAEAE7] shadow-sm select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={currentImage.image_url}
                  alt={car.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  draggable={false}
                />

                {/* Prev / Next buttons (visible on non-touch or hover) */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % displayImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                      aria-label="Ảnh tiếp theo"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                  {activeImageIndex + 1} / {displayImages.length}
                </span>

                {/* Swipe hint for mobile (fades out) */}
                {displayImages.length > 1 && (
                  <span className="absolute bottom-3 left-3 text-[10px] text-white/60 md:hidden">
                    Vuốt để xem ảnh khác
                  </span>
                )}
              </div>

              {/* Thumbnail Strip — scrolls horizontally on all screen sizes */}
              {displayImages.length > 1 && (
                <div
                  ref={thumbnailsRef}
                  className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
                >
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition shrink-0 w-16 sm:w-20 md:w-24 ${
                        activeImageIndex === idx
                          ? "border-[#9E7D53] ring-2 ring-[#9E7D53]/30"
                          : "border-[#EAEAE7] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Overview Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 p-4 md:p-5 bg-[#FFFFFF] border border-[#EAEAE7] rounded-xl shadow-sm text-center">
              <div className="space-y-1">
                <span className="text-[10px] text-[#66686B] uppercase tracking-wider block">Số Km Đã Đi</span>
                <span className="text-base font-display font-semibold text-[#121316]">
                  {car.odo_km.toLocaleString()} km
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#66686B] uppercase tracking-wider block">Hộp Số</span>
                <span className="text-base font-display font-semibold text-[#121316]">
                  {car.transmission}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#66686B] uppercase tracking-wider block">Nhiên Liệu</span>
                <span className="text-base font-display font-semibold text-[#121316]">
                  {car.fuel_type}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#66686B] uppercase tracking-wider block">Hệ Dẫn Động</span>
                <span className="text-base font-display font-semibold text-[#121316]">
                  {car.drivetrain}
                </span>
              </div>
            </div>

            {/* Description Narrative */}
            <div className="p-6 md:p-8 bg-white border border-[#EAEAE7] rounded-xl space-y-4 shadow-sm">
              <h2 className="text-lg font-display font-semibold text-[#121316]">
                Tổng Quan & Lịch Sử Xe
              </h2>
              <div className="text-sm text-[#66686B] leading-relaxed space-y-3 font-light">
                <p>{car.description || "Chiếc xe được thẩm định và nhập khẩu chính ngạch, đáp ứng tiêu chuẩn khắt khe bậc nhất của Atelier Curated Automotive."}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAEAE7]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#66686B]">Màu ngoại thất:</span>
                    <strong className="text-[#121316] font-semibold">{car.exterior_color || "Chưa rõ"}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#66686B]">Màu nội thất:</span>
                    <strong className="text-[#121316] font-semibold">{car.interior || "Chưa rõ"}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#66686B]">Số lượng chủ cũ:</span>
                    <strong className="text-[#121316] font-semibold">{car.owners_count === 0 ? "Xe mới chưa qua sử dụng" : `${car.owners_count} đời chủ`}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#66686B]">Bảo hành chính hãng:</span>
                    <strong className="text-[#121316] font-semibold">{car.has_factory_warranty ? `Còn ${car.warranty_months} tháng` : "Hết hạn"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            {car.specs && car.specs.length > 0 && (
              <div className="p-6 md:p-8 bg-white border border-[#EAEAE7] rounded-xl space-y-5 shadow-sm">
                <h2 className="text-lg font-display font-semibold text-[#121316]">
                  Thông Số Kỹ Thuật Động Cơ & Vận Hành
                </h2>
                <div className="divide-y divide-[#EAEAE7] text-xs">
                  {car.specs.map((item: any, idx: number) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <span className="text-[#66686B]">{item.label}</span>
                      <span className="font-mono font-medium text-[#121316]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection Report Card */}
            <div className="p-6 md:p-8 bg-[#F4F4F2] border border-[#EAEAE7] rounded-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9E7D53] block">
                    Verified Quality
                  </span>
                  <h2 className="text-lg font-display font-semibold text-[#121316] mt-0.5">
                    Biên Bản Thẩm Định 150 Điểm
                  </h2>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>150/150 Tiêu Chuẩn Đạt</span>
                </div>
              </div>

              <p className="text-xs text-[#66686B] leading-relaxed">
                Chiếc xe đã vượt qua 100% các bài kiểm tra thực nghiệm: Khung gầm unibody nguyên bản không biến dạng, hệ thống động cơ chưa từng tháo rã hay thủy kích, hệ thống phanh và điện tử vận hành hoàn hảo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded border border-[#EAEAE7] space-y-1">
                  <span className="text-[11px] font-semibold text-[#121316] block">Thân vỏ & Khung</span>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">✓ Sơn zin nguyên bản</span>
                </div>
                <div className="p-3 bg-white rounded border border-[#EAEAE7] space-y-1">
                  <span className="text-[11px] font-semibold text-[#121316] block">Động cơ & Hộp số</span>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">✓ Không thủy kích</span>
                </div>
                <div className="p-3 bg-white rounded border border-[#EAEAE7] space-y-1">
                  <span className="text-[11px] font-semibold text-[#121316] block">Hệ thống điện tử</span>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">✓ 0 mã lỗi ECU</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Action Box (desktop only) */}
          <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#EAEAE7] rounded-xl p-6 shadow-md space-y-6">
              {/* Price */}
              <div className="space-y-1 pb-4 border-b border-[#EAEAE7]">
                <span className="text-[11px] text-[#66686B] uppercase tracking-wider block">
                  Giá Chuyển Nhượng Niêm Yết
                </span>
                <div className="text-3xl font-display font-bold text-[#121316]">
                  {formatPrice(car.price)}
                </div>
                {car.monthly_installment && (
                  <div className="text-xs text-[#9E7D53] font-medium pt-1">
                    Ước tính trả góp: ~{(car.monthly_installment / 1_000_000).toFixed(0)} triệu / tháng
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => openModal({ id: car.id, name: car.name })}
                  className="w-full py-3.5 bg-[#121316] hover:bg-[#121316]/90 text-white font-semibold text-xs uppercase tracking-wider rounded transition shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#9E7D53]" />
                  <span>Đặt Lịch Lái Thử Riêng Tư</span>
                </button>

                <a
                  href="tel:0908123456"
                  className="w-full py-3 bg-[#F4F4F2] hover:bg-[#EAEAE7] text-[#121316] font-semibold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#9E7D53]" />
                  <span>Gọi Tư Vấn Ngay: 0908 123 456</span>
                </a>
              </div>

              {/* Security Commitments */}
              <div className="space-y-2.5 pt-4 border-t border-[#EAEAE7] text-xs text-[#66686B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#9E7D53] shrink-0" />
                  <span>Cam kết thu mua lại xe với khấu hao tối thiểu</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#9E7D53] shrink-0" />
                  <span>Giao dịch bảo mật thông tin tuyệt đối</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#9E7D53] shrink-0" />
                  <span>Hoàn tất thủ tục sang tên trong ngày</span>
                </div>
              </div>

              {/* Assigned Curator Card */}
              <div className="p-4 bg-[#F4F4F2] rounded-lg border border-[#EAEAE7] flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-300 shrink-0 border border-[#9E7D53]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Curator"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#9E7D53] font-semibold uppercase tracking-wider block">
                    Giám Đốc Thẩm Định
                  </span>
                  <p className="text-xs font-semibold text-[#121316] truncate">Trần Minh Quân</p>
                  <p className="text-[11px] text-[#66686B]">0908 123 456</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-[#EAEAE7] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
                  Cùng Phân Khúc
                </span>
                <h3 className="text-xl md:text-2xl font-display font-semibold text-[#121316] tracking-tight mt-0.5">
                  Các Mẫu Xe Tương Tự
                </h3>
              </div>
              <Link
                href="/xe"
                className="text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#9E7D53] transition flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {similarCars.map((sCar) => (
                <CarCard key={sCar.id} car={sCar} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Sticky CTA Bar (fixed bottom, hidden on lg+) ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-t border-[#EAEAE7] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Price mini-display */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[#66686B] uppercase tracking-wider block">Giá niêm yết</span>
            <span className="text-lg font-display font-bold text-[#121316] leading-tight">
              {formatPrice(car.price)}
            </span>
          </div>

          {/* Call button */}
          <a
            href="tel:0908123456"
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#F4F4F2] border border-[#EAEAE7] text-[#121316] font-semibold text-xs rounded-xl min-w-[80px] min-h-[52px]"
          >
            <Phone className="w-4 h-4 text-[#9E7D53]" />
            <span>Gọi</span>
          </a>

          {/* Test drive button */}
          <button
            onClick={() => openModal({ id: car.id, name: car.name })}
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#121316] hover:bg-[#121316]/90 text-white font-semibold text-xs rounded-xl flex-1 min-h-[52px]"
          >
            <Sparkles className="w-4 h-4 text-[#9E7D53]" />
            <span>Đặt Lịch Lái Thử</span>
          </button>
        </div>
        {/* Safe area spacer for phones with home indicator */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
