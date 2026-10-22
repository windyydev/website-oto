"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  UploadCloud, 
  X, 
  Check, 
  Star, 
  Sparkles, 
  AlertCircle,
  CarFront,
  Trash2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { adminApi, Brand, Car, CarImage } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface SelectedFile {
  file: File;
  previewUrl: string;
  category: "exterior" | "interior" | "dashboard" | "wheels";
  isPrimary: boolean;
}

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const carId = Number(resolvedParams.id);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);

  // Existing car images
  const [existingImages, setExistingImages] = useState<CarImage[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [monthlyInstallment, setMonthlyInstallment] = useState<number | "">("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [bodyType, setBodyType] = useState("SUV");
  const [fuelType, setFuelType] = useState("Xăng");
  const [transmission, setTransmission] = useState("Tự động");
  const [drivetrain, setDrivetrain] = useState("AWD");
  const [odoKm, setOdoKm] = useState<number>(0);
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [status, setStatus] = useState<"available" | "reserved" | "sold">("available");
  const [exteriorColor, setExteriorColor] = useState("");
  const [interior, setInterior] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // New Images to upload
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<"exterior" | "interior" | "dashboard" | "wheels">("exterior");

  useEffect(() => {
    fetchInitialData();
  }, [carId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [brandsData, carData] = await Promise.all([
        adminApi.getBrands(),
        adminApi.getCarById(carId),
      ]);

      setBrands(brandsData);
      
      // Populate car data
      setName(carData.name);
      setSlug(carData.slug);
      setBrandId(carData.brand_id);
      setPrice(carData.price);
      setMonthlyInstallment(carData.monthly_installment || "");
      setYear(carData.year);
      setBodyType(carData.body_type || "SUV");
      setFuelType(carData.fuel_type || "Xăng");
      setTransmission(carData.transmission || "Tự động");
      setDrivetrain(carData.drivetrain || "AWD");
      setOdoKm(carData.odo_km || 0);
      setCondition(carData.condition || "new");
      setStatus(carData.status || "available");
      setExteriorColor(carData.exterior_color || "");
      setInterior(carData.interior || "");
      setDescription(carData.description || "");
      setIsFeatured(Boolean(carData.is_featured));
      setExistingImages(carData.images || []);
    } catch (err: any) {
      console.error(err);
      setError("Không tìm thấy thông tin xe hoặc không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const newSelected: SelectedFile[] = filesArray.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      category: defaultCategory,
      isPrimary: false,
    }));

    setSelectedFiles((prev) => [...prev, ...newSelected]);
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!confirm("Bạn có chắc muốn xóa ảnh này khỏi bộ sưu tập?")) return;
    try {
      await adminApi.deleteCarImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert("Không thể xóa ảnh. Vui lòng thử lại sau.");
    }
  };

  const handleSetExistingPrimary = async (imageId: number) => {
    try {
      const updated = existingImages.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }));
      setExistingImages(updated);

      await adminApi.updateImagesOrder(
        carId,
        updated.map((img, idx) => ({
          id: img.id,
          sort_order: idx,
          is_primary: img.id === imageId,
        }))
      );
    } catch (err: any) {
      console.error(err);
      alert("Không thể cập nhật ảnh đại diện.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !brandId || !price) {
      setError("Vui lòng điền đầy đủ Tên xe, Hãng xe và Giá bán.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadStatus("Đang lưu thông tin cập nhật...");

      // 1. Cập nhật bản ghi Car trong Database
      const carData = {
        brand_id: Number(brandId),
        name,
        slug: slug || slugify(name),
        price: Number(price),
        monthly_installment: monthlyInstallment ? Number(monthlyInstallment) : undefined,
        year: Number(year),
        body_type: bodyType,
        fuel_type: fuelType,
        transmission,
        drivetrain,
        odo_km: Number(odoKm),
        condition,
        status,
        exterior_color: exteriorColor,
        interior,
        description,
        is_featured: isFeatured,
      };

      await adminApi.updateCar(carId, carData);

      // 2. Upload các ảnh mới thêm (nếu có)
      if (selectedFiles.length > 0) {
        setUploadStatus(`Đang tải ${selectedFiles.length} ảnh bổ sung lên Cloudinary...`);

        const categories: Array<"exterior" | "interior" | "dashboard" | "wheels"> = [
          "exterior",
          "interior",
          "dashboard",
          "wheels",
        ];

        for (const cat of categories) {
          const filesInCat = selectedFiles.filter((f) => f.category === cat);
          if (filesInCat.length > 0) {
            setUploadStatus(`Đang upload ảnh [${cat}] lên Cloudinary...`);
            await adminApi.uploadCarImages(
              carId,
              cat,
              filesInCat.map((f) => f.file)
            );
          }
        }
      }

      setUploadStatus("Cập nhật thành công!");
      setSuccess("Thông tin xe đã được lưu thành công.");
      setTimeout(() => {
        router.push("/admin/cars");
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Lỗi khi cập nhật xe.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[var(--text-secondary)]">Đang tải thông tin xe #{carId}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <AdminPageHeader
        breadcrumbs={{ category: "KHO XE SALA", subCategory: "CHỈNH SỬA XE" }}
        title="Chỉnh Sửa Thông Tin Xe"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/xe/${slug}`}
              target="_blank"
              className="px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem thực tế</span>
            </Link>
            <button
              type="button"
              onClick={() => router.push("/admin/cars")}
              className="px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[var(--brand-primary)] text-[var(--text-inverted)] hover:opacity-90 font-medium text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {uploadStatus && submitting && (
        <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--brand-gold)] text-[var(--brand-gold)] text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: THÔNG TIN CƠ BẢN */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <CarFront className="w-4 h-4 text-[var(--brand-gold)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              1. Thông Tin Nhận Diện & Định Danh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Tên Mẫu Xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Mercedes-Maybach S680 4MATIC"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Đường Dẫn Slug (Tự động sinh hoặc chỉnh tay)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mercedes-maybach-s680"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs font-mono text-[var(--text-primary)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Thương Hiệu / Hãng Xe <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="">-- Chọn Hãng Xe --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.country || "Châu Âu"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Năm Sản Xuất
              </label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GIÁ & TÀI CHÍNH */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-gold)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              2. Định Giá & Trả Góp Ước Tính
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Giá Bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000000"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="VD: 15990000000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs font-mono text-[var(--text-primary)] transition"
              />
              {typeof price === "number" && price > 0 && (
                <p className="mt-1 text-[11px] text-[var(--brand-gold)] font-medium">
                  Hiển thị: {(price / 1_000_000_000).toFixed(2)} tỷ VNĐ
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Trả Góp Hàng Tháng Dự Kiến (VNĐ / tháng)
              </label>
              <input
                type="number"
                min="0"
                step="1000000"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="VD: 120000000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs font-mono text-[var(--text-primary)] transition"
              />
              {typeof monthlyInstallment === "number" && monthlyInstallment > 0 && (
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Hiển thị: {(monthlyInstallment / 1_000_000).toFixed(1)} triệu / tháng
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: THÔNG SỐ KỸ THUẬT & TÌNH TRẠNG */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              3. Thông Số Kỹ Thuật & Hiện Trạng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Kiểu Dáng Thân Xe
              </label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="SUV">SUV Thượng Lưu</option>
                <option value="Sedan">Sedan Sang Trọng</option>
                <option value="Coupe">Coupe Thể Thao</option>
                <option value="Convertible">Convertible Mui Trần</option>
                <option value="Roadster">Siêu Xe Roadster</option>
                <option value="Grand Tourer">Grand Tourer (GT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Động Cơ & Nhiên Liệu
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="Xăng">Động cơ Xăng (V6/V8/V12)</option>
                <option value="Điện (EV)">Thuần Điện (EV Siêu Nạp)</option>
                <option value="Hybrid (PHEV)">Plug-in Hybrid (PHEV)</option>
                <option value="Mild-Hybrid">Mild-Hybrid (MHEV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Hệ Dẫn Động
              </label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="AWD">Tất Cả Các Bánh (AWD / 4MATIC / Quattro)</option>
                <option value="RWD">Cầu Sau Thể Thao (RWD)</option>
                <option value="FWD">Cầu Trước (FWD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Số Km Đã Đi (ODO)
              </label>
              <input
                type="number"
                min="0"
                value={odoKm}
                onChange={(e) => setOdoKm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs font-mono text-[var(--text-primary)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Tình Trạng Xe
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as "new" | "used")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="new">Xe Mới 100% (New In Box)</option>
                <option value="used">Đã Qua Tuyển Chọn (Atelier Certified Pre-Owned)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Trạng Thái Bàn Giao
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "available" | "reserved" | "sold")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="available">Sẵn Sàng Giao Ngay</option>
                <option value="reserved">Đang Đặt Cọc / Giữ Chỗ</option>
                <option value="sold">Đã Bàn Giao Khách VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Màu Sơn Ngoại Thất
              </label>
              <input
                type="text"
                value={exteriorColor}
                onChange={(e) => setExteriorColor(e.target.value)}
                placeholder="VD: Đen Obsidian / Xanh Crayon"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Chất Liệu & Màu Nội Thất
              </label>
              <input
                type="text"
                value={interior}
                onChange={(e) => setInterior(e.target.value)}
                placeholder="VD: Da Nappa Nâu Cognac cao cấp"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--brand-gold)] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Đánh dấu Xe Tiêu Biểu (Featured Showcase)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Mô Tả Chi Tiết & Tinh Hoa Chế Tác
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chuyên sâu về lịch sử xe, gói trang bị cá nhân hóa Bespoke..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
            />
          </div>
        </div>

        {/* SECTION 4: HÌNH ẢNH HIỆN CÓ CỦA XE */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                4. Ảnh Bộ Sưu Tập Hiện Có ({existingImages.length} ảnh)
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Nhấn sao để chọn ảnh đại diện chính
            </span>
          </div>

          {existingImages.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">
              Xe chưa có hình ảnh nào. Bạn có thể tải ảnh lên ở mục bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className={`relative rounded-lg overflow-hidden border group bg-[var(--surface-low)] ${
                    img.is_primary ? "border-[var(--brand-gold)] ring-1 ring-[var(--brand-gold)]" : "border-[var(--border-subtle)]"
                  }`}
                >
                  <div className="relative aspect-video w-full bg-[var(--surface-base)]">
                    <Image
                      src={img.image_url}
                      alt="Car image"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  <div className="p-2 flex items-center justify-between gap-1 text-[10px]">
                    <span className="uppercase font-mono text-[var(--text-muted)]">
                      {img.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetExistingPrimary(img.id)}
                        className={`p-1 rounded hover:bg-[var(--surface-base)] transition ${
                          img.is_primary ? "text-[var(--brand-gold)]" : "text-[var(--text-muted)]"
                        }`}
                        title={img.is_primary ? "Ảnh đại diện chính" : "Đặt làm ảnh đại diện"}
                      >
                        <Star className={`w-3.5 h-3.5 ${img.is_primary ? "fill-current" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {img.is_primary && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[var(--brand-gold)] text-black font-semibold text-[9px] uppercase tracking-wider">
                      Ảnh Chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: TẢI THÊM ẢNH MỚI LÊN CLOUDINARY */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                5. Tải Thêm Ảnh Mới (Lưu trữ Cloudinary)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Phân loại ảnh tải lên:</span>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as any)}
                className="px-2.5 py-1 rounded bg-[var(--surface-low)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
              >
                <option value="exterior">Ngoại Thất (Exterior)</option>
                <option value="interior">Nội Thất (Interior)</option>
                <option value="dashboard">Khoang Lái (Dashboard)</option>
                <option value="wheels">La-zăng & Phanh (Wheels)</option>
              </select>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand-gold)] rounded-xl p-8 text-center cursor-pointer transition bg-[var(--surface-low)]/50 hover:bg-[var(--surface-low)]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-base)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Nhấn để chọn ảnh từ máy tính hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Hỗ trợ PNG, JPG, WebP tối đa 10MB/ảnh
              </p>
            </div>
          </div>

          {/* New Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
                Ảnh mới chuẩn bị upload ({selectedFiles.length} ảnh):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-low)] group"
                  >
                    <div className="relative aspect-video w-full bg-[var(--surface-base)]">
                      <Image
                        src={item.previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1.5 text-[10px] text-[var(--text-muted)] uppercase font-mono">
                      {item.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => router.push("/admin/cars")}
            className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] text-[var(--text-inverted)] hover:opacity-90 font-medium text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu thông tin...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu Tất Cả Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
