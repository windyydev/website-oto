"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactConsultSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("consult");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      setLoading(true);
      setError(null);

      await api.post("/leads/", {
        name,
        phone,
        type,
        message,
        source: "Homepage Contact Section",
      });

      setSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setError("Không thể gửi thông tin. Vui lòng gọi trực tiếp Hotline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-[#F4F4F2] border-t border-[#EAEAE7]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Info */}
          <div className="space-y-6">
            <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
              Private Inquiries
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight">
              Khởi Đầu Trải Nghiệm <br />
              Cùng Chuyên Gia Atelier
            </h2>
            <p className="text-sm text-[#66686B] leading-relaxed max-w-md">
              Cho dù bạn đang tìm kiếm một phiên bản xe giới hạn, muốn định giá tài sản hiện tại hay cần tư vấn giải pháp tài chính kín đáo, đội ngũ Concierge của chúng tôi luôn sẵn sàng lắng nghe.
            </p>

            <div className="space-y-4 pt-4 border-t border-[#EAEAE7]">
              <div className="flex items-center gap-3 text-sm text-[#121316]">
                <div className="w-9 h-9 rounded bg-white border border-[#EAEAE7] flex items-center justify-center text-[#9E7D53] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#66686B] block">Hotline Trực Tiếp 24/7</span>
                  <a href="tel:0908123456" className="font-semibold hover:text-[#9E7D53] transition">
                    0908 123 456
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-[#121316]">
                <div className="w-9 h-9 rounded bg-white border border-[#EAEAE7] flex items-center justify-center text-[#9E7D53] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#66686B] block">Email Bộ Phận Tuyển Chọn</span>
                  <span className="font-semibold">concierge@atelier-auto.vn</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-[#121316]">
                <div className="w-9 h-9 rounded bg-white border border-[#EAEAE7] flex items-center justify-center text-[#9E7D53] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#66686B] block">Phòng Trưng Bày Trung Tâm</span>
                  <span className="font-semibold">Số 18 Đường Lê Duẩn, Bến Nghé, Quận 1, TP. HCM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#FFFFFF] border border-[#EAEAE7] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-display font-semibold text-[#121316]">
              Gửi Yêu Cầu Tư Vấn Riêng Tư
            </h3>
            <p className="text-xs text-[#66686B] mt-1 mb-6">
              Mọi thông tin cá nhân của bạn được bảo mật tuyệt đối theo quy chuẩn Atelier.
            </p>

            {success ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#9E7D53] mx-auto" />
                <h4 className="text-base font-semibold text-[#121316]">Yêu Cầu Đã Được Tiếp Nhận</h4>
                <p className="text-xs text-[#66686B] max-w-sm mx-auto">
                  Chuyên viên tư vấn cấp cao của chúng tôi sẽ chủ động liên hệ lại theo số điện thoại bạn cung cấp.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-2 bg-[#F4F4F2] text-xs font-semibold rounded hover:bg-[#EAEAE7] transition"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#121316]">Nhu cầu của bạn</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] focus:outline-none focus:border-[#9E7D53]"
                  >
                    <option value="consult">Tư vấn chọn xe & Báo giá chi tiết</option>
                    <option value="appraisal">Định giá & Thu mua xe cũ</option>
                    <option value="consignment">Ký gửi xe thể thao / xe sang</option>
                    <option value="installment">Tư vấn gói tài chính & trả góp</option>
                    <option value="concierge">Tìm kiếm dòng xe hiếm theo yêu cầu</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#121316]">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] placeholder:text-[#66686B]/60 focus:outline-none focus:border-[#9E7D53]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#121316]">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 xxx xxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] placeholder:text-[#66686B]/60 focus:outline-none focus:border-[#9E7D53]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#121316]">Nội dung tin nhắn / Mẫu xe quan tâm</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Tôi quan tâm dòng Porsche 911 GT3 hoặc cần định giá xe Mercedes C300..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBFBFA] border border-[#EAEAE7] rounded text-xs text-[#121316] placeholder:text-[#66686B]/60 focus:outline-none focus:border-[#9E7D53]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#121316] hover:bg-[#121316]/90 text-white font-semibold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#9E7D53]" />
                  <span>{loading ? "Đang gửi..." : "Gửi Thông Tin Yêu Cầu"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
