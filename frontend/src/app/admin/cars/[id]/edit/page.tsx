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
  ExternalLink,
  Layers,
  Palette,
  Wrench,
  Cpu,
  ShieldCheck,
  Plus,
  ChevronRight
} from "lucide-react";
import { 
  adminApi, 
  Brand, 
  Car, 
  CarImage, 
  Category, 
  CarColor, 
  CarOption 
} from "@/lib/api";
import { slugify, formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface SelectedFile {
  file: File;
  previewUrl: string;
  category: "exterior" | "interior" | "dashboard" | "wheels";
  isPrimary: boolean;
}

const OPTION_GROUPS = [
  "Mâm xe & Lốp",
  "Nội thất & Ghế da",
  "Hiệu năng & Khung gầm",
  "Âm thanh & Tiện nghi cao cấp",
  "An toàn & Trợ lái",
];

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
  const [categories, setCategories] = useState<Category[]>([]);

  // Existing car images
  const [existingImages, setExistingImages] = useState<CarImage[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
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
  const [isInspected, setIsInspected] = useState(true);

  // Specs state
  const [specs, setSpecs] = useState<Array<{ group: string; label: string; value: string }>>([]);

  // Configurator Studio: Colors
  const [colors, setColors] = useState<CarColor[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#1A1A1A");
  const [newColorType, setNewColorType] = useState<"standard" | "metallic" | "bespoke">("standard");
  const [newColorPriceDelta, setNewColorPriceDelta] = useState<number>(0);
  const [newColorImages, setNewColorImages] = useState("");
  const [newColorIsDefault, setNewColorIsDefault] = useState(false);
  const [addingColor, setAddingColor] = useState(false);

  // Configurator Studio: Options
  const [options, setOptions] = useState<CarOption[]>([]);
  const [newOptGroup, setNewOptGroup] = useState("Mâm xe & Lốp");
  const [newOptName, setNewOptName] = useState("");
  const [newOptCode, setNewOptCode] = useState("");
  const [newOptPrice, setNewOptPrice] = useState<number>(0);
  const [newOptIsStandard, setNewOptIsStandard] = useState(false);
  const [addingOption, setAddingOption] = useState(false);

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
      const [brandsData, catsData, carData] = await Promise.all([
        adminApi.getBrands(),
        adminApi.getCategories(),
        adminApi.getCarById(carId),
      ]);

      setBrands(brandsData);
      setCategories(catsData);
      
      // Populate car data
      setName(carData.name);
      setSlug(carData.slug);
      setBrandId(carData.brand_id);
      setCategoryId(carData.category_id || "");
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
      setIsInspected(Boolean(carData.is_inspected));
      setSpecs(carData.specs || []);
      setColors(carData.colors || []);
      setOptions(carData.options || []);
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

  // Add Color Handler
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    try {
      setAddingColor(true);
      const imgList = newColorImages
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await adminApi.addCarColor(carId, {
        name: newColorName.trim(),
        hex_code: newColorHex,
        color_type: newColorType,
        price_delta: Number(newColorPriceDelta) || 0,
        images: imgList,
        is_default: newColorIsDefault,
      });

      setColors((prev) => [...prev, created]);
      setNewColorName("");
      setNewColorPriceDelta(0);
      setNewColorImages("");
      setNewColorIsDefault(false);
    } catch (err: any) {
      alert("Lỗi khi thêm màu: " + (err.response?.data?.detail || err.message));
    } finally {
      setAddingColor(false);
    }
  };

  const handleDeleteColor = async (colorId: number, colorName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa màu "${colorName}"?`)) return;
    try {
      await adminApi.deleteCarColor(carId, colorId);
      setColors((prev) => prev.filter((c) => c.id !== colorId));
    } catch (err: any) {
      alert("Lỗi khi xóa màu: " + (err.response?.data?.detail || err.message));
    }
  };

  // Add Option Handler
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptName.trim()) return;
    try {
      setAddingOption(true);
      const created = await adminApi.addCarOption(carId, {
        group: newOptGroup,
        name: newOptName.trim(),
        code: newOptCode.trim() || undefined,
        price: Number(newOptPrice) || 0,
        is_standard: newOptIsStandard,
      });

      setOptions((prev) => [...prev, created]);
      setNewOptName("");
      setNewOptCode("");
      setNewOptPrice(0);
      setNewOptIsStandard(false);
    } catch (err: any) {
      alert("Lỗi khi thêm tùy chọn: " + (err.response?.data?.detail || err.message));
    } finally {
      setAddingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: number, optName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tùy chọn "${optName}"?`)) return;
    try {
      await adminApi.deleteCarOption(carId, optionId);
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } catch (err: any) {
      alert("Lỗi khi xóa tùy chọn: " + (err.response?.data?.detail || err.message));
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
        category_id: categoryId ? Number(categoryId) : undefined,
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
        is_inspected: isInspected,
        specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      };

      await adminApi.updateCar(carId, carData);

      // 2. Upload các ảnh mới thêm (nếu có)
      if (selectedFiles.length > 0) {
        setUploadStatus(`Đang tải ${selectedFiles.length} ảnh bổ sung lên Cloudinary...`);

        const categoriesList: Array<"exterior" | "interior" | "dashboard" | "wheels"> = [
          "exterior",
          "interior",
          "dashboard",
          "wheels",
        ];

        for (const cat of categoriesList) {
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
      setSuccess("Toàn bộ thông tin xe, màu sắc và cấu hình đã được lưu thành công.");
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
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header Bar */}
      <AdminPageHeader
        breadcrumbs={{ category: "KHO XE SALA", subCategory: "CHỈNH SỬA XE" }}
        title="Chỉnh Sửa Thông Tin & Cấu Hình Xe"
        description={`Cập nhật thông số kỹ thuật, bảng màu sắc studio, options trang bị cho ${name}.`}
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
        {/* SECTION 1: THÔNG TIN CƠ BẢN & PHÂN CẤP */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <CarFront className="w-4 h-4 text-[var(--brand-gold)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              1. Thông Tin Nhận Diện & Phân Cấp Danh Mục
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
                Đường Dẫn Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
                Phân Cấp Danh Mục Xe (Category Tree)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition"
              >
                <option value="">-- Chưa gắn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {"— ".repeat((c.level || 1) - 1)} {c.name}
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
                Giá Bán Niêm Yết (VNĐ) <span className="text-red-500">*</span>
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

        {/* SECTION 3: THÔNG SỐ VẬN HÀNH & KIỂM ĐỊNH */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              3. Vận Hành, Hiện Trạng & Kiểm Định 150 Điểm
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
                Màu Sơn Ngoại Thất Mặc Định
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

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--brand-gold)] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Ghim xe nổi bật Showcase
                </span>
              </label>

              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInspected}
                  onChange={(e) => setIsInspected(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đạt kiểm định 150 điểm Atelier
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

        {/* SECTION 4: BẢNG THÔNG SỐ ĐỘNG HỌC (SPECS) */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                4. Bảng Thông Số Động Học & Kỹ Thuật (Specs JSON)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSpecs([...specs, { group: "Động cơ & Hiệu năng", label: "", value: "" }])}
              className="text-xs text-[var(--brand-gold)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng thông số</span>
            </button>
          </div>

          {specs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-low)] rounded-lg">
              Chưa có thông số kỹ thuật nào. Bấm &quot;Thêm dòng thông số&quot; để khai báo.
            </div>
          ) : (
            <div className="space-y-2.5">
              {specs.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nhóm (VD: Vận hành)"
                    value={item.group}
                    onChange={(e) => {
                      const updated = [...specs];
                      updated[idx].group = e.target.value;
                      setSpecs(updated);
                    }}
                    className="sm:col-span-4 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                  />
                  <input
                    type="text"
                    placeholder="Tên thông số (VD: Tăng tốc 0-100)"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...specs];
                      updated[idx].label = e.target.value;
                      setSpecs(updated);
                    }}
                    className="sm:col-span-4 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                  />
                  <input
                    type="text"
                    placeholder="Giá trị (VD: 3.5s)"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...specs];
                      updated[idx].value = e.target.value;
                      setSpecs(updated);
                    }}
                    className="sm:col-span-3 px-3 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                    className="sm:col-span-1 p-2 text-[var(--text-muted)] hover:text-red-500 transition text-center flex items-center justify-center cursor-pointer"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: STUDIO CẤU HÌNH MÀU SẮC (CAR COLORS) */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                5. Cấu Hình Màu Sắc Studio Configurator ({colors.length} màu)
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Phục vụ trình đổi màu 3D/Studio thời gian thực
            </span>
          </div>

          {/* List Existing Colors */}
          {colors.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-low)] rounded-lg">
              Xe chưa có bảng màu Studio. Thêm màu mới ở biểu mẫu phía dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="p-3 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-7 h-7 rounded-full border border-white/20 shrink-0 shadow-inner"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {color.name}
                        </span>
                        {color.is_default && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--brand-gold)] text-black font-bold uppercase">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] block">
                        {color.price_delta > 0 ? `+${formatPrice(color.price_delta)}` : "Tiêu chuẩn"} • {color.color_type}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteColor(color.id, color.name)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10 transition shrink-0 cursor-pointer"
                    title="Xóa màu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Color Form */}
          <div className="p-4 bg-[var(--surface-low)] rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              Thêm Biến Thể Màu Sắc Mới
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Tên màu sơn</label>
                <input
                  type="text"
                  placeholder="VD: Gentian Blue Metallic"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Mã HEX màu</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] uppercase focus:outline-none focus:border-[var(--brand-gold)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Phân loại màu</label>
                <select
                  value={newColorType}
                  onChange={(e) => setNewColorType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                >
                  <option value="standard">Tiêu chuẩn (Standard)</option>
                  <option value="metallic">Ánh kim (Metallic)</option>
                  <option value="bespoke">Độc bản (Bespoke Special)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Giá phụ thu (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  placeholder="0"
                  value={newColorPriceDelta || ""}
                  onChange={(e) => setNewColorPriceDelta(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                Link ảnh xe theo màu này (Mỗi link 1 dòng hoặc cách nhau dấu phẩy)
              </label>
              <textarea
                rows={2}
                placeholder="https://images.unsplash.com/photo-..."
                value={newColorImages}
                onChange={(e) => setNewColorImages(e.target.value)}
                className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={newColorIsDefault}
                  onChange={(e) => setNewColorIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--brand-gold)]"
                />
                <span>Đặt làm màu mặc định khi mở Studio</span>
              </label>

              <button
                type="button"
                onClick={handleAddColor}
                disabled={addingColor || !newColorName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {addingColor ? "Đang thêm..." : "+ Thêm màu này"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: TRANG BỊ TÙY CHỌN & PHỤ KIỆN (CAR OPTIONS) */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                6. Trang Bị Tùy Chọn & Phụ Kiện Cao Cấp ({options.length} trang bị)
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Khách hàng có thể chọn cộng thêm vào giá tổng
            </span>
          </div>

          {/* List Options */}
          {options.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-low)] rounded-lg">
              Xe chưa có trang bị tùy chọn nào. Thêm trang bị ở biểu mẫu bên dưới.
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] font-medium text-[10px] shrink-0 border border-[var(--brand-gold)]/20">
                      {opt.group}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {opt.name}
                    </span>
                    {opt.code && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-mid)] font-mono text-[var(--text-muted)]">
                        {opt.code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-medium text-[var(--brand-gold)]">
                      {opt.is_standard ? "Tiêu chuẩn (0 đ)" : formatPrice(opt.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(opt.id, opt.name)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10 transition cursor-pointer"
                      title="Xóa trang bị này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Option Form */}
          <div className="p-4 bg-[var(--surface-low)] rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
              Thêm Trang Bị Option Mới
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Nhóm trang bị</label>
                <select
                  value={newOptGroup}
                  onChange={(e) => setNewOptGroup(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                >
                  {OPTION_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Tên trang bị</label>
                <input
                  type="text"
                  placeholder="VD: Hệ thống phanh gốm Carbon PCCB"
                  value={newOptName}
                  onChange={(e) => setNewOptName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Mã option (Mã code)</label>
                <input
                  type="text"
                  placeholder="VD: 1LX"
                  value={newOptCode}
                  onChange={(e) => setNewOptCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">Giá trang bị (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  placeholder="0"
                  disabled={newOptIsStandard}
                  value={newOptIsStandard ? 0 : newOptPrice || ""}
                  onChange={(e) => setNewOptPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={newOptIsStandard}
                    onChange={(e) => setNewOptIsStandard(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--brand-gold)]"
                  />
                  <span>Là trang bị tiêu chuẩn (0 VNĐ)</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={addingOption || !newOptName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {addingOption ? "Đang thêm..." : "+ Thêm option này"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: HÌNH ẢNH HIỆN CÓ CỦA XE */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                7. Ảnh Bộ Sưu Tập Showroom ({existingImages.length} ảnh)
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Nhấn sao ⭐ để chọn ảnh đại diện chính của xe
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
                        className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
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

        {/* SECTION 8: TẢI THÊM ẢNH MỚI LÊN CLOUDINARY */}
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[var(--brand-gold)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                8. Tải Thêm Ảnh Mới (Lưu trữ Cloudinary)
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
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-[var(--brand-gold)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">
              Nhấn vào đây để tải thêm hình ảnh chất lượng cao
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Ảnh sẽ được gắn nhãn mặc định là:{" "}
              <strong className="text-[var(--text-primary)] uppercase">{defaultCategory}</strong>
            </p>
          </div>

          {/* Preview New Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {selectedFiles.length} ảnh mới đang chờ tải lên:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-low)]"
                  >
                    <div className="relative aspect-video w-full">
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 flex items-center justify-between text-[10px]">
                      <span className="uppercase text-[var(--text-muted)] font-mono">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="text-red-500 hover:opacity-80 p-0.5 cursor-pointer"
                        title="Bỏ ảnh này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => router.push("/admin/cars")}
            className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition"
          >
            Hủy và Quay Lại
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] text-[var(--text-inverted)] hover:opacity-90 font-medium text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang Lưu Toàn Bộ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Lưu Tất Cả Cập Nhật</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
