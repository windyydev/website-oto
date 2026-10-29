"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadCloud, 
  X, 
  Check, 
  Star, 
  Sparkles, 
  AlertCircle,
  CarFront,
  Plus,
  Trash2,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { adminApi, Brand, Category } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface SelectedFile {
  file: File;
  previewUrl: string;
  category: "exterior" | "interior" | "dashboard" | "wheels";
  isPrimary: boolean;
}

export default function CreateCarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
  const [specs, setSpecs] = useState<Array<{ group: string; label: string; value: string }>>([
    { group: "Động cơ & Hiệu năng", label: "Kiểu động cơ", value: "V6 Twin-Turbo" },
    { group: "Động cơ & Hiệu năng", label: "Công suất cực đại", value: "450 mã lực" },
    { group: "Động cơ & Hiệu năng", label: "Tăng tốc 0-100 km/h", value: "3.8 giây" },
    { group: "Động cơ & Hiệu năng", label: "Tốc độ tối đa", value: "305 km/h" },
  ]);

  // Images state
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<"exterior" | "interior" | "dashboard" | "wheels">("exterior");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [brandsData, catsData] = await Promise.all([
        adminApi.getBrands(),
        adminApi.getCategories(),
      ]);
      setBrands(brandsData);
      setCategories(catsData);
      if (brandsData.length > 0) setBrandId(brandsData[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const newSelected: SelectedFile[] = filesArray.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      category: defaultCategory,
      isPrimary: selectedFiles.length === 0 && idx === 0,
    }));

    setSelectedFiles((prev) => [...prev, ...newSelected]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index,
      }))
    );
  };

  const handleCategoryChange = (index: number, cat: "exterior" | "interior" | "dashboard" | "wheels") => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category: cat } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !brandId || !price) {
      setError("Vui lòng điền đầy đủ Tên xe, Hãng xe và Giá bán.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadStatus("Đang lưu thông tin xe vào cơ sở dữ liệu...");

      // 1. Tạo bản ghi Car trong Database
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

      const createdCar = await adminApi.createCar(carData);
      const carId = createdCar.id;

      // 2. Upload từng nhóm ảnh lên Cloudinary nếu có ảnh được chọn
      if (selectedFiles.length > 0) {
        setUploadStatus(`Đang tải ${selectedFiles.length} ảnh lên Cloudinary...`);

        const categories: Array<"exterior" | "interior" | "dashboard" | "wheels"> = [
          "exterior",
          "interior",
          "dashboard",
          "wheels",
        ];

        let uploadedList: any[] = [];

        for (const cat of categories) {
          const filesInCat = selectedFiles.filter((f) => f.category === cat);
          if (filesInCat.length > 0) {
            setUploadStatus(`Đang upload ảnh [${cat}] lên Cloudinary...`);
            const uploadRes = await adminApi.uploadCarImages(
              carId,
              cat,
              filesInCat.map((f) => f.file)
            );
            if (uploadRes?.images) {
              uploadedList = [...uploadedList, ...uploadRes.images];
            }
          }
        }

        // 3. Đánh dấu ảnh chính (Primary)
        const primaryIndex = selectedFiles.findIndex((f) => f.isPrimary);
        if (primaryIndex !== -1 && uploadedList[primaryIndex]) {
          await adminApi.updateImagesOrder(carId, [
            {
              id: uploadedList[primaryIndex].id,
              sort_order: 0,
              is_primary: true,
            },
          ]);
        }
      }

      setUploadStatus("Hoàn tất!");
      router.push("/admin/cars");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Lỗi khi tạo xe.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <AdminPageHeader
        breadcrumbs={{ category: "KHO XE SALA", subCategory: "ĐĂNG TẢI XE MỚI" }}
        title="Đăng Tải Xe Mới Vào Showroom"
        description="Khai báo thông số kỹ thuật và tải lên hình ảnh chất lượng cao lưu trữ tại Cloudinary."
        actions={
          <Link
            href="/admin/cars"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Bộ sưu tập</span>
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Thông tin cơ bản */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg space-y-5 shadow-xs">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CarFront className="w-4 h-4 text-[var(--brand-gold)]" />
            1. Thông Tin Nhận Diện & Giá Bán
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên xe */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Tên xe <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="VD: Porsche 911 Carrera S"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Đường dẫn thân thiện (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] font-mono"
              />
            </div>

            {/* Hãng xe */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Hãng sản xuất <span className="text-red-500">*</span></label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phân cấp danh mục */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Phân cấp Danh mục xe</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                <option value="">-- Chưa gắn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {"— ".repeat((c.level || 1) - 1)} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Giá niêm yết */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Giá bán niêm yết (VNĐ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                placeholder="VD: 8500000000"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--brand-gold)] font-mono font-semibold focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Trả góp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Ước tính trả góp hàng tháng (VNĐ)</label>
              <input
                type="number"
                placeholder="VD: 55000000"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Thông số kỹ thuật */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg space-y-5 shadow-xs">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-gold)]" />
            2. Thông Số Kỹ Thuật & Tình Trạng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Năm sản xuất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Năm sản xuất</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* ODO */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Số km đã đi (ODO)</label>
              <input
                type="number"
                value={odoKm}
                onChange={(e) => setOdoKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Kiểu dáng */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Kiểu dáng</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Coupe">Coupe</option>
                <option value="Crossover">Crossover</option>
                <option value="Convertible">Convertible (Mui trần)</option>
                <option value="Hatchback">Hatchback</option>
                <option value="MPV">MPV</option>
              </select>
            </div>

            {/* Nhiên liệu */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Nhiên liệu</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                <option value="Xăng">Xăng</option>
                <option value="Dầu">Dầu (Diesel)</option>
                <option value="Điện">Thuần Điện (EV)</option>
                <option value="Hybrid">Hybrid (Lai xăng - điện)</option>
              </select>
            </div>

            {/* Hộp số */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Hộp số</label>
              <input
                type="text"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Dẫn động */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Hệ dẫn động</label>
              <input
                type="text"
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Màu ngoại thất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Màu ngoại thất</label>
              <input
                type="text"
                value={exteriorColor}
                onChange={(e) => setExteriorColor(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Màu nội thất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Màu nội thất</label>
              <input
                type="text"
                value={interior}
                onChange={(e) => setInterior(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            {/* Tình trạng */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Tình trạng xe</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                <option value="new">Xe mới 100%</option>
                <option value="used">Xe lướt (Đã qua sử dụng)</option>
              </select>
            </div>

            {/* Trạng thái kho */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Trạng thái kho</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
              >
                <option value="available">Sẵn sàng giao ngay</option>
                <option value="reserved">Đã nhận cọc</option>
                <option value="sold">Đã bàn giao xe</option>
              </select>
            </div>

            {/* Nổi bật */}
            <div className="space-y-1.5 sm:col-span-2 flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--brand-gold)] bg-[var(--surface-low)] border-[var(--border-subtle)]"
                />
                <span>Ghim xe nổi bật lên trang chủ showroom (Featured)</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Mô tả chi tiết / Lịch sử xe</label>
            <textarea
              rows={4}
              placeholder="Nhập thông tin trang bị nổi bật, lịch sử bảo dưỡng chính hãng, cam kết không đâm đụng ngập nước..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
        </div>

        {/* Section 3: Bảng thông số kỹ thuật động học */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--brand-gold)]" />
              <span>3. Bảng Thông Số Động Học & Kỹ Thuật (Specs)</span>
            </h2>
            <button
              type="button"
              onClick={() => setSpecs([...specs, { group: "Động cơ & Hiệu năng", label: "", value: "" }])}
              className="text-xs text-[var(--brand-gold)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thông số</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {specs.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nhóm (VD: Động cơ)"
                  value={spec.group}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[idx].group = e.target.value;
                    setSpecs(updated);
                  }}
                  className="sm:col-span-4 px-3 py-1.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
                <input
                  type="text"
                  placeholder="Tên thông số (VD: Công suất)"
                  value={spec.label}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[idx].label = e.target.value;
                    setSpecs(updated);
                  }}
                  className="sm:col-span-4 px-3 py-1.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
                />
                <input
                  type="text"
                  placeholder="Giá trị (VD: 450 mã lực)"
                  value={spec.value}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[idx].value = e.target.value;
                    setSpecs(updated);
                  }}
                  className="sm:col-span-3 px-3 py-1.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                  className="sm:col-span-1 p-1.5 text-[var(--text-muted)] hover:text-red-500 transition text-center flex items-center justify-center cursor-pointer"
                  title="Xóa thông số này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2">
            <input
              type="checkbox"
              id="isInspectedCheck"
              checked={isInspected}
              onChange={(e) => setIsInspected(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--brand-gold)]"
            />
            <label htmlFor="isInspectedCheck" className="text-xs text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Đã kiểm định 150 điểm chất lượng độc lập Atelier Verified</span>
            </label>
          </div>
        </div>

        {/* Section 4: Upload ảnh Cloudinary */}
        <div className="p-6 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-lg space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[var(--brand-gold)]" />
                4. Bộ Ảnh Chi Tiết Xe (Cloudinary Storage)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Kéo thả hoặc chọn nhiều ảnh. Ảnh sẽ tự động tối ưu và lưu vào Cloudinary.
              </p>
            </div>

            {/* Category selector for new uploads */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Phân loại mặc định:</span>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as any)}
                className="px-2.5 py-1 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)]"
              >
                <option value="exterior">Ngoại thất</option>
                <option value="interior">Nội thất</option>
                <option value="dashboard">Vô lăng & Taplo</option>
                <option value="wheels">Mâm & Lốp</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand-gold)] bg-[var(--surface-low)]/50 hover:bg-[var(--surface-low)] rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-muted)] group-hover:text-[var(--brand-gold)] transition">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Nhấp để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Hỗ trợ PNG, JPG, WebP. Tải lên nhiều ảnh cùng lúc.
              </p>
            </div>
          </div>

          {/* Selected Images Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Đã chọn <strong className="text-[var(--brand-gold)]">{selectedFiles.length}</strong> ảnh</span>
                <span>Bấm vào dấu sao để chọn làm Ảnh Đại Diện</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border bg-[var(--surface-base)] group ${
                      item.isPrimary
                        ? "border-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/20"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-low)]">
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Badge primary */}
                    {item.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[var(--brand-gold)] text-black text-[10px] font-bold shadow-md">
                        Ảnh Chính
                      </span>
                    )}

                    {/* Quick controls */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        title="Đặt làm ảnh chính"
                        className={`p-1 rounded-full backdrop-blur-md transition ${
                          item.isPrimary
                            ? "bg-[var(--brand-gold)] text-black"
                            : "bg-black/60 text-white/70 hover:text-[var(--brand-gold)]"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        title="Xóa ảnh"
                        className="p-1 rounded-full bg-black/60 text-white/70 hover:text-red-400 backdrop-blur-md transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category drop down */}
                    <div className="p-1.5 bg-[var(--surface-low)] border-t border-[var(--border-subtle)]">
                      <select
                        value={item.category}
                        onChange={(e) => handleCategoryChange(idx, e.target.value as any)}
                        className="w-full bg-[var(--surface-base)] text-[11px] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5"
                      >
                        <option value="exterior">Ngoại thất</option>
                        <option value="interior">Nội thất</option>
                        <option value="dashboard">Vô lăng/Taplo</option>
                        <option value="wheels">Mâm xe</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Link
            href="/admin/cars"
            className="px-5 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-low)] transition"
          >
            Hủy Bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{uploadStatus || "Đang xử lý..."}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu & Đăng Bán Xe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
