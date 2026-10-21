"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // If inside /admin route, don't show public footer
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#121316] text-[#FBFBFA] pt-16 pb-12 border-t border-[#2f3130]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#2f3130]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#9E7D53] flex items-center justify-center text-[#121316] font-display font-bold text-sm">
                A
              </div>
              <div>
                <span className="font-display font-semibold text-lg tracking-wider uppercase text-white block">
                  Atelier
                </span>
                <span className="text-[10px] text-[#9E7D53] font-medium tracking-[0.2em] block uppercase">
                  Curated Automotive
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-[#dadad9] max-w-sm">
              Không gian tuyển chọn những mẫu xe thể thao và xe sang nguyên bản chuẩn mực. 
              Mỗi tác phẩm cơ khí đều trải qua quy trình kiểm định 150 điểm độc lập và minh bạch tuyệt đối về nguồn gốc.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1b1b1f] border border-[#2f3130] text-[11px] text-[#9E7D53]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D53]" />
                Chứng nhận kiểm định 150 điểm độc lập
              </span>
            </div>
          </div>

          {/* Nav Group 1: Bộ Sưu Tập */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-white">
              Bộ Sưu Tập
            </h4>
            <ul className="space-y-2.5 text-xs text-[#dadad9]">
              <li>
                <Link href="/xe?brand=porsche" className="hover:text-[#9E7D53] transition">
                  Porsche Tuyển Chọn
                </Link>
              </li>
              <li>
                <Link href="/xe?brand=mercedes-benz" className="hover:text-[#9E7D53] transition">
                  Mercedes-AMG Hiệu Năng
                </Link>
              </li>
              <li>
                <Link href="/xe?brand=bmw" className="hover:text-[#9E7D53] transition">
                  BMW M Series Motorsport
                </Link>
              </li>
              <li>
                <Link href="/xe?body_type=suv" className="hover:text-[#9E7D53] transition">
                  SUV Đô Thị & Địa Hình
                </Link>
              </li>
              <li>
                <Link href="/xe" className="hover:text-[#9E7D53] transition flex items-center gap-1">
                  Xem tất cả kho xe <ArrowUpRight className="w-3 h-3 text-[#9E7D53]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Group 2: Dịch Vụ */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-white">
              Đặc Quyền Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-xs text-[#dadad9]">
              <li>
                <Link href="/dich-vu" className="hover:text-[#9E7D53] transition">
                  Thẩm Định Xe 150 Tiêu Chí
                </Link>
              </li>
              <li>
                <Link href="/dich-vu" className="hover:text-[#9E7D53] transition">
                  Ký Gửi Bảo Mật Danh Tính
                </Link>
              </li>
              <li>
                <Link href="/dich-vu" className="hover:text-[#9E7D53] transition">
                  Lái Thử Tận Tư Gia
                </Link>
              </li>
              <li>
                <Link href="/dich-vu" className="hover:text-[#9E7D53] transition">
                  Gói Tài Chính & Bảo Hiểm
                </Link>
              </li>
              <li>
                <Link href="/ve-chung-toi" className="hover:text-[#9E7D53] transition">
                  Triết Lý Atelier
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Group 3: Showroom */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-white">
              Trụ Sở Tiếp Đón
            </h4>
            <div className="space-y-3 text-xs text-[#dadad9]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9E7D53] shrink-0 mt-0.5" />
                <span>Số 18 Đường Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#9E7D53] shrink-0" />
                <a href="tel:0908123456" className="hover:text-[#9E7D53] transition font-semibold">
                  0908 123 456
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#9E7D53] shrink-0" />
                <span>concierge@atelier-auto.vn</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#9E7D53] shrink-0" />
                <span>08:30 - 20:00 (Thứ 2 - Chủ Nhật)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#848387] gap-4">
          <p>© {new Date().getFullYear()} Atelier Curated Automotive. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-white transition">
              Cổng Quản Trị Showroom
            </Link>
            <span>•</span>
            <Link href="/ve-chung-toi" className="hover:text-white transition">
              Chính Sách Bảo Mật
            </Link>
            <span>•</span>
            <Link href="/dich-vu" className="hover:text-white transition">
              Quy Trình Giao Dịch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
