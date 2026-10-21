"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Filter, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  CarFront,
  Sparkles,
  X,
  SlidersHorizontal
} from "lucide-react";
import { adminApi, Car, Brand } from "@/lib/api";
import CarCard from "@/components/car/CarCard";
import { useTestDrive } from "@/context/TestDriveContext";

// ─── Reusable Filter Panel Content ───────────────────────────────────────────
function FilterPanel({
  search,
  setSearch,
  selectedBrand,
  setSelectedBrand,
  selectedBodyType,
  setSelectedBodyType,
  brands,
  applyFilters,
  handleResetFilters,
  onApplyClose,
}: {
  search: string;
  setSearch: (v: string) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  selectedBodyType: string;
  setSelectedBodyType: (v: string) => void;
  brands: Brand[];
  applyFilters: (overrides?: any) => void;
  handleResetFilters: () => void;
  onApplyClose?: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-sm text-[#121316] flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9E7D53]" />
          Bộ Lọc Tiêu Chí
        </span>
        <button
          onClick={handleResetFilters}
          className="text-[11px] text-[#66686B] hover:text-[#9E7D53] flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Thiết lập lại
        </button>
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#121316]">Tìm kiếm theo từ khóa</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66686B]" />
          <input
            type="text"
            placeholder="VD: GT3, AMG, M4..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-9 pr-3 py-2.5 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] placeholder:text-[#66686B]/60 focus:outline-none focus:border-[#9E7D53]"
          />
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#121316]">Thương hiệu</label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => {
              setSelectedBrand("");
              applyFilters({ brand: "" });
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs transition flex items-center justify-between min-h-[36px] ${
              selectedBrand === ""
                ? "bg-[#121316] text-white font-medium"
                : "text-[#66686B] hover:bg-[#F4F4F2]"
            }`}
          >
            <span>Tất cả thương hiệu</span>
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                const next = selectedBrand === String(b.id) ? "" : String(b.id);
                setSelectedBrand(next);
                applyFilters({ brand: next });
              }}
              className={`w-full text-left px-3 py-2 rounded text-xs transition flex items-center justify-between min-h-[36px] ${
                selectedBrand === String(b.id)
                  ? "bg-[#121316] text-white font-medium"
                  : "text-[#66686B] hover:bg-[#F4F4F2]"
              }`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body Type Filter */}
      <div className="space-y-2 pt-4 border-t border-[#EAEAE7]">
        <label className="text-xs font-semibold text-[#121316]">Kiểu dáng thân xe</label>
        <div className="grid grid-cols-2 gap-2">
          {["Coupe", "SUV", "Sedan", "Convertible"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                const next = selectedBodyType === type ? "" : type;
                setSelectedBodyType(next);
                applyFilters({ body: next });
              }}
              className={`py-2.5 px-2.5 rounded text-xs text-center border transition min-h-[40px] ${
                selectedBodyType === type
                  ? "bg-[#9E7D53] border-[#9E7D53] text-[#121316] font-semibold"
                  : "bg-[#FBFBFA] border-[#EAEAE7] text-[#66686B] hover:border-[#9E7D53]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          applyFilters();
          onApplyClose?.();
        }}
        className="w-full py-3 bg-[#121316] hover:bg-[#121316]/90 text-white font-semibold text-xs uppercase tracking-wider rounded transition"
      >
        Áp Dụng Bộ Lọc
      </button>
    </div>
  );
}

// ─── Active filter count badge ────────────────────────────────────────────────
function activeFilterCount(brand: string, body: string, search: string) {
  return [brand, body, search].filter(Boolean).length;
}

// ─── Main catalog component ───────────────────────────────────────────────────
function CarCollectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useTestDrive();

  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand_id") || "");
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get("body_type") || "");
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("min_price") ? "filtered" : ""
  );

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    adminApi.getBrands().then((res) => setBrands(res)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCars();
  }, [searchParams]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params: any = {
        page_size: 50,
        sort: searchParams.get("sort") || "newest",
      };
      if (searchParams.get("search")) params.search = searchParams.get("search");
      if (searchParams.get("brand_id")) params.brand_id = Number(searchParams.get("brand_id"));
      if (searchParams.get("body_type")) params.body_type = searchParams.get("body_type");
      if (searchParams.get("min_price")) params.min_price = Number(searchParams.get("min_price"));
      if (searchParams.get("max_price")) params.max_price = Number(searchParams.get("max_price"));

      const res = await adminApi.getCars(params);
      setCars(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (overrides?: any) => {
    const params = new URLSearchParams();
    const brand = overrides?.brand !== undefined ? overrides.brand : selectedBrand;
    const body = overrides?.body !== undefined ? overrides.body : selectedBodyType;
    const s = overrides?.search !== undefined ? overrides.search : search;
    const st = overrides?.sort !== undefined ? overrides.sort : sort;

    if (s) params.set("search", s);
    if (brand) params.set("brand_id", brand);
    if (body) params.set("body_type", body);
    if (st) params.set("sort", st);

    router.push(`/xe?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedBodyType("");
    setSelectedCondition("");
    setPriceRange("");
    setSort("newest");
    router.push("/xe");
  };

  const filterCount = activeFilterCount(selectedBrand, selectedBodyType, search);

  return (
    <div className="bg-[#FBFBFA] min-h-screen pb-24 relative">
      {/* Mobile Filter Bottom-Sheet Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#121316]/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileFilterOpen(false)}
      />

      {/* Mobile Filter Bottom-Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#FBFBFA] rounded-t-2xl shadow-2xl border-t border-[#EAEAE7] transition-transform duration-300 ease-out ${
          mobileFilterOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#EAEAE7]" />
        </div>
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EAEAE7]">
          <span className="font-display font-semibold text-sm text-[#121316]">Bộ Lọc</span>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="p-2 rounded-full hover:bg-[#F4F4F2] transition text-[#66686B] min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Sheet content */}
        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "calc(85vh - 100px)" }}>
          <FilterPanel
            search={search}
            setSearch={setSearch}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedBodyType={selectedBodyType}
            setSelectedBodyType={setSelectedBodyType}
            brands={brands}
            applyFilters={applyFilters}
            handleResetFilters={handleResetFilters}
            onApplyClose={() => setMobileFilterOpen(false)}
          />
        </div>
      </div>

      {/* Breadcrumb & Hero Bar */}
      <div className="bg-[#F4F4F2] border-b border-[#EAEAE7] py-6 md:py-8">
        <div className="max-w-[1480px] mx-auto px-5 lg:px-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#66686B] mb-3">
            <Link href="/" className="hover:text-[#121316] transition">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-[#E2E2DF]" />
            <span className="text-[#121316] font-medium">Bộ sưu tập xe</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
                Atelier Catalog
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight mt-1">
                Bộ Sưu Tập Xe Tuyển Chọn
              </h1>
            </div>
            <p className="text-xs text-[#66686B]">
              Hiển thị <strong className="text-[#121316] font-semibold">{total}</strong> cỗ máy đạt chuẩn sẵn sàng bàn giao
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="max-w-[1480px] mx-auto px-5 lg:px-12 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Filter Sidebar (Desktop only) */}
          <aside className="hidden lg:block space-y-8 bg-white border border-[#EAEAE7] p-6 rounded-xl h-fit shadow-sm">
            <FilterPanel
              search={search}
              setSearch={setSearch}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedBodyType={selectedBodyType}
              setSelectedBodyType={setSelectedBodyType}
              brands={brands}
              applyFilters={applyFilters}
              handleResetFilters={handleResetFilters}
            />
          </aside>

          {/* Right: Cars Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 md:p-4 bg-white border border-[#EAEAE7] rounded-xl">
              <div className="flex items-center gap-2">
                {/* Mobile filter trigger button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3.5 py-2 bg-[#F4F4F2] border border-[#EAEAE7] rounded-lg text-xs font-semibold text-[#121316] flex items-center gap-2 min-h-[40px] relative"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E7D53]" />
                  <span>Bộ lọc</span>
                  {filterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#9E7D53] text-[#121316] text-[10px] font-bold rounded-full flex items-center justify-center">
                      {filterCount}
                    </span>
                  )}
                </button>
                <span className="text-xs text-[#66686B]">
                  Đang hiển thị <strong>{cars.length}</strong> kết quả
                </span>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#66686B] whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value });
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] focus:outline-none focus:border-[#9E7D53] min-h-[40px]"
                >
                  <option value="newest">Mới nhập kho gần nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="year_desc">Năm sản xuất mới nhất</option>
                  <option value="odo_asc">Số km (ODO) thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Active filters indicator (mobile only) */}
            {filterCount > 0 && (
              <div className="lg:hidden flex items-center gap-2 flex-wrap">
                {selectedBrand && brands.find(b => String(b.id) === selectedBrand) && (
                  <span className="px-3 py-1 bg-[#121316] text-white text-[11px] rounded-full flex items-center gap-1.5">
                    {brands.find(b => String(b.id) === selectedBrand)?.name}
                    <button onClick={() => { setSelectedBrand(""); applyFilters({ brand: "" }); }} className="hover:text-[#9E7D53]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBodyType && (
                  <span className="px-3 py-1 bg-[#121316] text-white text-[11px] rounded-full flex items-center gap-1.5">
                    {selectedBodyType}
                    <button onClick={() => { setSelectedBodyType(""); applyFilters({ body: "" }); }} className="hover:text-[#9E7D53]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="px-3 py-1 bg-[#121316] text-white text-[11px] rounded-full flex items-center gap-1.5">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => { setSearch(""); applyFilters({ search: "" }); }} className="hover:text-[#9E7D53]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button onClick={handleResetFilters} className="text-[11px] text-[#9E7D53] underline">
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Cars List / Empty state */}
            {loading ? (
              <div className="py-28 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#9E7D53] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#66686B]">Đang thẩm định danh sách xe...</span>
              </div>
            ) : cars.length === 0 ? (
              <div className="py-24 px-6 text-center bg-white border border-[#EAEAE7] rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#F4F4F2] border border-[#EAEAE7] flex items-center justify-center text-[#9E7D53] mx-auto">
                  <CarFront className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-base text-[#121316]">
                    Không Tìm Thấy Mẫu Xe Phù Hợp
                  </h3>
                  <p className="text-xs text-[#66686B] max-w-md mx-auto">
                    Hiện tại kho chưa có xe đúng với tiêu chí tìm kiếm của bạn. Hãy thử xóa bớt bộ lọc hoặc gửi yêu cầu tìm xe Concierge.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 border border-[#EAEAE7] text-xs font-semibold text-[#121316] rounded hover:bg-[#F4F4F2] min-h-[44px]"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                  <button
                    onClick={() => openModal()}
                    className="px-4 py-2.5 bg-[#9E7D53] text-xs font-semibold text-[#121316] rounded hover:bg-[#9E7D53]/90 min-h-[44px]"
                  >
                    Yêu cầu tìm xe riêng
                  </button>
                </div>
              </div>
            ) : (
              // 1 col mobile / 2 col tablet / 3 col desktop
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Concierge Banner Box */}
            <div className="mt-12 p-6 md:p-8 bg-[#121316] text-[#FBFBFA] rounded-xl border border-[#2f3130] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs text-[#9E7D53] font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Dịch Vụ Concierge Sưu Tầm</span>
                </div>
                <h4 className="text-xl font-display font-semibold text-white">
                  Bạn Đang Tìm Kiếm Một Chiếc Xe Độc Bản?
                </h4>
                <p className="text-xs text-[#dadad9] leading-relaxed font-light">
                  Mạng lưới Atelier tại Đức, Anh và Nhật Bản có thể săn tìm và thẩm định chiếc xe mơ ước của bạn theo đúng số VIN, màu ngoại thất và tùy chọn trang bị mong muốn.
                </p>
              </div>

              <button
                onClick={() => openModal()}
                className="w-full md:w-auto px-6 py-3 bg-[#9E7D53] hover:bg-[#9E7D53]/90 text-[#121316] font-semibold text-xs uppercase tracking-wider rounded shrink-0 transition min-h-[48px]"
              >
                Gửi Yêu Cầu Tìm Xe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarCollectionPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs">Đang tải bộ sưu tập...</div>}>
      <CarCollectionContent />
    </Suspense>
  );
}
