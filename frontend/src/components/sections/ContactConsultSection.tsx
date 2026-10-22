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
    <section className="py-24 bg-[var(--surface-low)] border-t border-[var(--border-subtle)]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Info */}
          <div className="space-y-6">
            <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
              Private Inquiries
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
              Khởi Đầu Trải Nghiệm <br />
              Cùng Chuyên Gia Atelier
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
              Cho dù bạn đang tìm kiếm một phiên bản xe giới hạn, muốn định giá tài sản hiện tại hay cần tư vấn giải pháp tài chính kín đáo, đội ngũ Concierge của chúng tôi luôn sẵn sàng lắng nghe.
            </p>

            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <div className="w-9 h-9 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] block">Hotline Trực Tiếp 24/7</span>
                  <a href="tel:0908123456" className="font-semibold hover:text-[var(--brand-gold)] transition">
                    0908 123 456
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <div className="w-9 h-9 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] block">Email Bộ Phận Tuyển Chọn</span>
                  <span className="font-semibold">concierge@atelier-auto.vn</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <div className="w-9 h-9 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-gold)] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] block">Phòng Trưng Bày Trung Tâm</span>
                  <span className="font-semibold">Số 18 Đường Lê Duẩn, Bến Nghé, Quận 1, TP. HCM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-xs">
            <h3 className="text-xl font-display font-semibold text-[var(--text-primary)]">
              Gửi Yêu Cầu Tư Vấn Riêng Tư
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-6">
              Mọi thông tin cá nhân của bạn được bảo mật tuyệt đối theo quy chuẩn Atelier.
            </p>

            {success ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[var(--brand-gold)] mx-auto" />
                <h4 className="text-base font-semibold text-[var(--text-primary)]">Yêu Cầu Đã Được Tiếp Nhận</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Chuyên viên tư vấn cấp cao của chúng tôi sẽ chủ động liên hệ lại theo số điện thoại bạn cung cấp.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-2 bg-[var(--surface-low)] text-xs font-semibold rounded hover:bg-[var(--surface-mid)] transition text-[var(--text-primary)]"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-primary)]">Nhu cầu của bạn</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-gold)]"
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
                    <label className="text-xs font-medium text-[var(--text-primary)]">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-primary)]">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 xxx xxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-primary)]">Nội dung tin nhắn / Mẫu xe quan tâm</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Tôi quan tâm dòng Porsche 911 GT3 hoặc cần định giá xe Mercedes C300..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-low)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--text-inverted)] font-semibold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
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
