"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Check, 
  Star, 
  Sparkles, 
  AlertCircle,
  CarFront
} from "lucide-react";
import { adminApi, Brand } from "@/lib/api";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
  const [exteriorColor, setExteriorColor] = useState("Trắng");
  const [interior, setInterior] = useState("Da Nappa Đen");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  // Images state
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<"exterior" | "interior" | "dashboard" | "wheels">("exterior");

  useEffect(() => {
    adminApi.getBrands().then((res) => {
      setBrands(res);
      if (res.length > 0) {
        setBrandId(res[0].id);
      }
    });
  }, []);

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
      isPrimary: selectedFiles.length === 0 && idx === 0, // First image is default primary
    }));

    setSelectedFiles((prev) => [...prev, ...newSelected]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed item was primary, set new primary if exists
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

      const createdCar = await adminApi.createCar(carData);
      const carId = createdCar.id;

      // 2. Upload từng nhóm ảnh lên Cloudinary nếu có ảnh được chọn
      if (selectedFiles.length > 0) {
        setUploadStatus(`Đang tải ${selectedFiles.length} ảnh lên Cloudinary...`);

        // Gom nhóm theo category
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
      setError(err.response?.data?.detail || "Có lỗi xảy ra khi tạo xe và upload ảnh.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cars"
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Thêm Xe Mới Vào Kho</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Nhập thông số xe và tải trực tiếp ảnh sắc nét lên Cloudinary.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Thông tin cơ bản */}
        <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <CarFront className="w-4 h-4 text-amber-400" />
            1. Thông Tin Nhận Diện & Giá Bán
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên xe */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-300">Tên xe <span className="text-amber-500">*</span></label>
              <input
                type="text"
                required
                placeholder="VD: Porsche 911 Carrera S"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Đường dẫn thân thiện (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-400 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Hãng xe */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Hãng sản xuất <span className="text-amber-500">*</span></label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Giá niêm yết */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Giá bán niêm yết (VNĐ) <span className="text-amber-500">*</span></label>
              <input
                type="number"
                required
                placeholder="VD: 8500000000"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Trả góp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Ước tính trả góp hàng tháng (VNĐ)</label>
              <input
                type="number"
                placeholder="VD: 55000000"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Thông số kỹ thuật */}
        <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            2. Thông Số Kỹ Thuật & Tình Trạng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Năm sản xuất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Năm sản xuất</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* ODO */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Số km đã đi (ODO)</label>
              <input
                type="number"
                value={odoKm}
                onChange={(e) => setOdoKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Kiểu dáng */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Kiểu dáng</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
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
              <label className="text-xs font-medium text-zinc-300">Nhiên liệu</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Xăng">Xăng</option>
                <option value="Dầu">Dầu (Diesel)</option>
                <option value="Điện">Thuần Điện (EV)</option>
                <option value="Hybrid">Hybrid (Lai xăng - điện)</option>
              </select>
            </div>

            {/* Hộp số */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Hộp số</label>
              <input
                type="text"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Dẫn động */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Hệ dẫn động</label>
              <input
                type="text"
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Màu ngoại thất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Màu ngoại thất</label>
              <input
                type="text"
                value={exteriorColor}
                onChange={(e) => setExteriorColor(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Màu nội thất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Màu nội thất</label>
              <input
                type="text"
                value={interior}
                onChange={(e) => setInterior(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tình trạng */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Tình trạng xe</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="new">Xe mới 100%</option>
                <option value="used">Xe lướt (Đã qua sử dụng)</option>
              </select>
            </div>

            {/* Trạng thái kho */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Trạng thái kho</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="available">Sẵn sàng giao ngay</option>
                <option value="reserved">Đã nhận cọc</option>
                <option value="sold">Đã bàn giao xe</option>
              </select>
            </div>

            {/* Nổi bật */}
            <div className="space-y-1.5 sm:col-span-2 flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500 bg-zinc-950 border-zinc-800"
                />
                <span>Ghim xe nổi bật lên trang chủ showroom (Featured)</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-zinc-300">Mô tả chi tiết / Lịch sử xe</label>
            <textarea
              rows={4}
              placeholder="Nhập thông tin trang bị nổi bật, lịch sử bảo dưỡng chính hãng, cam kết không đâm đụng ngập nước..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 3: Upload ảnh Cloudinary */}
        <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                3. Bộ Ảnh Chi Tiết Xe (Cloudinary Storage)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kéo thả hoặc chọn nhiều ảnh. Ảnh sẽ tự động tối ưu và lưu vào Cloudinary.
              </p>
            </div>

            {/* Category selector for new uploads */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Phân loại mặc định:</span>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as any)}
                className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200"
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
            className="border-2 border-dashed border-zinc-700 hover:border-amber-500/80 bg-zinc-950/50 hover:bg-zinc-950/80 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-zinc-900 group-hover:bg-amber-500/10 text-zinc-400 group-hover:text-amber-400 transition">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Nhấp để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Hỗ trợ PNG, JPG, WebP. Tải lên nhiều ảnh cùng lúc.
              </p>
            </div>
          </div>

          {/* Selected Images Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Đã chọn <strong className="text-amber-400">{selectedFiles.length}</strong> ảnh</span>
                <span className="text-zinc-500">Bấm vào dấu sao để chọn làm Ảnh Đại Diện</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border bg-zinc-950 group ${
                      item.isPrimary
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Badge primary */}
                    {item.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold shadow-md">
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
                            ? "bg-amber-500 text-black"
                            : "bg-black/60 text-zinc-400 hover:text-amber-400"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        title="Xóa ảnh"
                        className="p-1 rounded-full bg-black/60 text-zinc-400 hover:text-red-400 backdrop-blur-md transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category drop down */}
                    <div className="p-1.5 bg-zinc-900 border-t border-zinc-800">
                      <select
                        value={item.category}
                        onChange={(e) => handleCategoryChange(idx, e.target.value as any)}
                        className="w-full bg-zinc-950 text-[11px] text-zinc-300 border border-zinc-800 rounded px-1.5 py-0.5"
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
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
          <Link
            href="/admin/cars"
            className="px-5 py-2.5 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition"
          >
            Hủy Bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
