"use client";

import { useState, useEffect } from "react";
import { useTestDrive } from "@/context/TestDriveContext";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  CarFront, 
  Copy, 
  Check, 
  CalendarPlus, 
  Download, 
  Printer 
} from "lucide-react";
import { toast } from "sonner";
import { api, adminApi, Car } from "@/lib/api";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

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
  const [copied, setCopied] = useState(false);

  const activeCarName = selectedCar?.name || cars.find((c) => c.id === carId)?.name || "Xe Showroom";

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
        if (selectedCar.configDetails) {
          const { atelierCode, colorName, totalPrice, optionsCount } = selectedCar.configDetails;
          const formattedPrice = totalPrice ? `${(totalPrice / 1_000_000_000).toFixed(2)} tỷ` : "";
          setNotes(`[Cấu hình Atelier: ${atelierCode || "Bespoke"}] Màu: ${colorName || "Tiêu chuẩn"}${optionsCount ? `, ${optionsCount} gói trang bị nâng cấp` : ""}${formattedPrice ? ` (Dự toán: ~${formattedPrice})` : ""}`);
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-[var(--text-primary)]">
        {/* Top Gold Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--brand-gold)] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-[10px] font-semibold text-[var(--brand-gold)] uppercase tracking-widest block">
              Trải Nghiệm Độc Bản
            </span>
            <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mt-0.5">
              Đặt Lịch Lái Thử Riêng Tư
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-low)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {successCode ? (
            <div className="py-4 space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-display font-semibold text-[var(--text-primary)]">
                  Đặt Lịch Lái Thử Thành Công!
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto leading-relaxed">
                  Chuyên viên quản lý trải nghiệm Atelier sẽ liên hệ với Quý khách trong vòng 15 phút để chuẩn bị xe và lộ trình riêng tư.
                </p>
              </div>

              {/* VIP Ticket Card */}
              <div className="bg-[var(--surface-low)] border border-[var(--brand-gold)]/40 rounded-xl p-5 text-left space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Mã Xác Nhận VIP</span>
                    <span className="text-lg font-mono font-bold text-[var(--brand-gold)] block">
                      {successCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(successCode);
                      setCopied(true);
                      toast.success("Đã sao chép mã đặt lịch!");
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Mẫu xe</span>
                    <strong className="text-[var(--text-primary)] font-semibold">{activeCarName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Khách hàng</span>
                    <strong className="text-[var(--text-primary)] font-semibold">{name} ({phone})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Thời gian</span>
                    <span className="text-[var(--text-primary)]">{date} · {timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Địa điểm</span>
                    <span className="text-[var(--text-primary)]">
                      {locationType === "showroom" ? "Showroom Atelier (KĐT Sala)" : `Tại nhà: ${address || "Theo yêu cầu"}`}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] font-semibold text-[var(--text-primary)] block">Vé Check-in Nhanh</span>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Quét mã QR tại bàn lễ tân khi quý khách tới showroom để nhận xe lái thử ngay.
                    </p>
                  </div>

                  <div className="p-1.5 bg-white rounded-lg border border-[var(--border-subtle)] shadow-xs shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(successCode)}&color=0B0C0E&bgcolor=FFFFFF`}
                      alt={`QR Code ${successCode}`}
                      className="w-20 h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Calendar & Print */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <a
                  href={getGoogleCalendarUrl({
                    bookingCode: successCode,
                    carName: activeCarName,
                    date: date || new Date().toISOString().split("T")[0],
                    timeSlot,
                    locationType,
                    address,
                    customerName: name,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  <span>Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    downloadIcsFile({
                      bookingCode: successCode,
                      carName: activeCarName,
                      date: date || new Date().toISOString().split("T")[0],
                      timeSlot,
                      locationType,
                      address,
                      customerName: name,
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  <span>Tải file .ICS</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] text-xs text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  <span>In vé</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-8 py-2.5 bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] text-xs uppercase tracking-wider font-semibold rounded-lg transition cursor-pointer shadow-sm"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Mẫu xe */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                  <CarFront className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  Mẫu xe bạn muốn trải nghiệm <span className="text-[var(--brand-gold)]">*</span>
                </label>
                {selectedCar ? (
                  <div className="space-y-2">
                    <div className="px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm font-semibold text-[var(--brand-gold)]">
                      {selectedCar.name}
                    </div>
                    {selectedCar.configDetails && (
                      <div className="p-3 bg-[var(--surface-low)] rounded-lg border border-[var(--brand-gold)]/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[var(--brand-gold)]">
                            Mã Cấu Hình: {selectedCar.configDetails.atelierCode}
                          </span>
                          {selectedCar.configDetails.totalPrice && (
                            <span className="font-mono font-bold text-[var(--text-primary)]">
                              {(selectedCar.configDetails.totalPrice / 1_000_000_000).toFixed(2)} tỷ VND
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-4 flex-wrap">
                          {selectedCar.configDetails.colorName && (
                            <span>Màu sơn: <strong className="text-[var(--text-primary)] font-medium">{selectedCar.configDetails.colorName}</strong></span>
                          )}
                          {selectedCar.configDetails.optionsCount !== undefined && (
                            <span>Trang bị: <strong className="text-[var(--text-primary)] font-medium">{selectedCar.configDetails.optionsCount} tùy chọn</strong></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    required
                    value={carId}
                    onChange={(e) => setCarId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)] transition"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[var(--surface-base)] text-[var(--text-primary)]">
                        {c.name} ({c.year}) - {(c.price / 1_000_000_000).toFixed(2)} tỷ
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Họ và tên <span className="text-[var(--brand-gold)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Số điện thoại <span className="text-[var(--brand-gold)]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0908 xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Email nhận vé xác nhận (Tuỳ chọn)</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                />
              </div>

              {/* Ngày & Giờ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                    Ngày hẹn lái thử <span className="text-[var(--brand-gold)]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                    Khung giờ mong muốn
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                  >
                    <option value="09:00 - 11:00" className="bg-[var(--surface-base)] text-[var(--text-primary)]">Buổi sáng (09:00 - 11:00)</option>
                    <option value="14:00 - 16:00" className="bg-[var(--surface-base)] text-[var(--text-primary)]">Buổi chiều (14:00 - 16:00)</option>
                    <option value="16:30 - 18:30" className="bg-[var(--surface-base)] text-[var(--text-primary)]">Hoàng hôn (16:30 - 18:30)</option>
                  </select>
                </div>
              </div>

              {/* Địa điểm */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  Hình thức tiếp đón
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType("showroom")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      locationType === "showroom"
                        ? "bg-[var(--brand-gold)]/15 border-[var(--brand-gold)] text-[var(--brand-gold)] font-semibold shadow-xs"
                        : "bg-[var(--surface-low)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Tại Showroom Atelier
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType("home")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      locationType === "home"
                        ? "bg-[var(--brand-gold)]/15 border-[var(--brand-gold)] text-[var(--brand-gold)] font-semibold shadow-xs"
                        : "bg-[var(--surface-low)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Đưa xe tận tư gia
                  </button>
                </div>
              </div>

              {locationType === "home" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Địa chỉ tư gia / cơ quan</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Khu biệt thự Chateau, Phú Mỹ Hưng, Q.7"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                  />
                </div>
              )}

              {/* Ghi chú */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Yêu cầu đặc biệt</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mong muốn trải nghiệm cung đường cao tốc, có mang theo gia đình..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--brand-gold)] hover:opacity-90 text-[#0B0C0E] font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer"
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
