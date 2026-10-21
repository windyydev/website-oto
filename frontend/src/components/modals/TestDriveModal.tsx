"use client";

import { useState, useEffect } from "react";
import { useTestDrive } from "@/context/TestDriveContext";
import { X, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, CarFront } from "lucide-react";
import { api, adminApi, Car } from "@/lib/api";

export default function TestDriveModal() {
  const { isOpen, closeModal, selectedCar } = useTestDrive();
  const [cars, setCars] = useState<Car[]>([]);
  const [carId, setCarId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00 - 11:00");
  const [locationType, setLocationType] = useState<"showroom" | "home">("showroom");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessCode(null);
      // Set default tomorrow date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split("T")[0]);

      if (selectedCar) {
        setCarId(selectedCar.id);
      } else {
        adminApi.getCars({ page_size: 50, status: "available" }).then((res) => {
          setCars(res.items || []);
          if (res.items && res.items.length > 0) {
            setCarId(res.items[0].id);
          }
        });
      }
    }
  }, [isOpen, selectedCar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId || !name || !phone || !date) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appointmentDate = new Date(`${date}T10:00:00Z`).toISOString();

      const res = await api.post("/leads/test-drive", {
        name,
        phone,
        email: email || undefined,
        car_id: Number(carId),
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        location_type: locationType,
        address: locationType === "home" ? address : undefined,
        notes: notes || undefined,
      });

      setSuccessCode(res.data.booking_code);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Không thể đặt lịch. Vui lòng thử lại hoặc gọi Hotline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
          <div>
            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest block">
              Trải Nghiệm Độc Bản
            </span>
            <h3 className="text-xl font-display font-semibold text-white mt-0.5">
              Đặt Lịch Lái Thử Riêng Tư
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {successCode ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Đặt Lịch Lái Thử Thành Công!</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                  Chuyên viên quản lý trải nghiệm của Atelier sẽ liên hệ với bạn trong vòng 15 phút để xác nhận lộ trình lái thử.
                </p>
              </div>

              <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 max-w-xs mx-auto text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Mã Xác Nhận Đặt Lịch</span>
                <span className="text-xl font-mono font-bold text-amber-400 mt-1 block">
                  {successCode}
                </span>
              </div>

              <button
                onClick={closeModal}
                className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Mẫu xe */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <CarFront className="w-3.5 h-3.5 text-amber-400" />
                  Mẫu xe bạn muốn trải nghiệm <span className="text-amber-500">*</span>
                </label>
                {selectedCar ? (
                  <div className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-semibold text-amber-400">
                    {selectedCar.name}
                  </div>
                ) : (
                  <select
                    required
                    value={carId}
                    onChange={(e) => setCarId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.year}) - {(c.price / 1_000_000_000).toFixed(2)} tỷ
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Họ và tên <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Số điện thoại <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0908 xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Email nhận vé xác nhận (Tuỳ chọn)</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Ngày & Giờ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Ngày hẹn lái thử <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Khung giờ mong muốn
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="09:00 - 11:00">Buổi sáng (09:00 - 11:00)</option>
                    <option value="14:00 - 16:00">Buổi chiều (14:00 - 16:00)</option>
                    <option value="16:30 - 18:30">Hoàng hôn (16:30 - 18:30)</option>
                  </select>
                </div>
              </div>

              {/* Địa điểm */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Hình thức tiếp đón
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType("showroom")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                      locationType === "showroom"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Tại Showroom Atelier
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType("home")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                      locationType === "home"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Đưa xe tận tư gia
                  </button>
                </div>
              </div>

              {locationType === "home" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Địa chỉ tư gia / cơ quan</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Khu biệt thự Chateau, Phú Mỹ Hưng, Q.7"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Ghi chú */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Yêu cầu đặc biệt</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mong muốn trải nghiệm cung đường cao tốc, có mang theo gia đình..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {loading ? "Đang xử lý đặt lịch..." : "Xác Nhận Đặt Lịch Lái Thử"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
