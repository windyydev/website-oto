"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nếu đã đăng nhập rồi thì redirect thẳng vào /admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng điền đầy đủ tài khoản và mật khẩu");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login({ username: username.trim(), password });
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Tài khoản hoặc mật khẩu không chính xác.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("Atelier@2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#FBFBFA] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9E7D53]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#9E7D53]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1C20] border border-[#2D3138] text-[11px] text-[#9E7D53] tracking-widest uppercase font-semibold mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Administrative Security</span>
          </div>

          <h1 className="text-2xl font-display font-semibold tracking-tight text-white">
            ATELIER CURATED AUTOMOTIVE
          </h1>
          <p className="text-xs text-[#9E9E9C] font-light">
            Cổng quản trị bảo mật dành riêng cho ban điều hành showroom
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#121316] border border-[#2D3138] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9E7D53] to-transparent rounded-t-2xl" />

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#C8C9C7]">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66686B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin hoặc admin@atelier.vn"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C20] border border-[#2D3138] rounded-lg text-sm text-white placeholder-[#55575A] focus:outline-none focus:border-[#9E7D53] focus:ring-1 focus:ring-[#9E7D53] transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#C8C9C7]">
                Mật khẩu quản trị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66686B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1A1C20] border border-[#2D3138] rounded-lg text-sm text-white placeholder-[#55575A] focus:outline-none focus:border-[#9E7D53] focus:ring-1 focus:ring-[#9E7D53] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66686B] hover:text-[#C8C9C7] transition"
                  tabIndex={-1}
                  aria-label="Ẩn hiện mật khẩu"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-[#9E7D53] hover:bg-[#8A6C44] text-[#0B0C0E] font-semibold text-xs uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-[#22252A] flex items-center justify-between text-[11px] text-[#888A8D]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D53]" />
              <span>Tài khoản Master: <code className="text-white">admin</code></span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#9E7D53] hover:underline cursor-pointer font-medium"
            >
              Điền nhanh
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-[#55575A] mt-6">
          © {new Date().getFullYear()} Atelier Curated Automotive. Hệ thống được bảo vệ bởi chuẩn mã hóa JWT 256-bit.
        </p>
      </div>
    </div>
  );
}
