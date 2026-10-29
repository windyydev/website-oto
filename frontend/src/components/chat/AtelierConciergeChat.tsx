"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Send, 
  Car as CarIcon, 
  RotateCcw, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  PhoneCall,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { chatApi, ChatMessage, SuggestedCarCard } from "@/lib/api";

const INITIAL_GREETING: ChatMessage = {
  role: "model",
  content: 
    "Dạ em kính chào Quý khách! Em là **Atelier VIP Concierge** — Trợ lý tư vấn xe sang riêng tư tại showroom Atelier (Khu đô thị Sala, TP. Thủ Đức).\n\n" +
    "Em có thể hỗ trợ Quý khách tra cứu kho xe có sẵn, tư vấn phương án trả góp ngân hàng, giải đáp quy trình kiểm định 150 điểm hoặc đặt lịch lái thử tận nơi. Quý khách đang quan tâm đến dòng xe nào hôm nay ạ?",
  suggested_cars: []
};

const DEFAULT_PROMPTS = [
  "Có mẫu SUV nào đang sẵn xe?",
  "Bảng tính trả góp xe 4 tỷ trong 5 năm",
  "Quy trình kiểm định 150 điểm gồm những gì?",
  "Tôi muốn đặt lịch lái thử tại showroom Sala"
];

export default function AtelierConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_PROMPTS);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
    }
  }, [isOpen, messages, isLoading]);

  // Tải danh sách gợi ý từ backend
  useEffect(() => {
    chatApi.getSuggestedPrompts()
      .then((prompts) => {
        if (prompts && prompts.length > 0) {
          setSuggestedPrompts(prompts);
        }
      })
      .catch(() => {
        // Fallback dùng DEFAULT_PROMPTS
      });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText("");

    // Thêm tin nhắn user vào danh sách
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Chuẩn bị lịch sử hội thoại gửi lên backend
      const historyPayload = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatApi.sendMessage(text, historyPayload);

      const botMsg: ChatMessage = {
        role: "model",
        content: res.reply,
        suggested_cars: res.suggested_cars || [],
        action_taken: res.action_taken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: "model",
        content: "Dạ em xin lỗi Quý khách, kết nối tư vấn hiện đang có chút gián đoạn. Quý khách vui lòng để lại số điện thoại hoặc gọi hotline **090 123 4567**, chuyên viên Atelier sẽ phục vụ Quý khách ngay ạ.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setInputText("");
  };

  // Helper format tiền tỷ VNĐ
  const formatCarPrice = (price: number) => {
    if (!price) return "Liên hệ Atelier";
    const ty = price / 1_000_000_000;
    if (ty >= 1) {
      return `${ty.toFixed(2).replace(/\.00$/, '')} Tỷ VNĐ`;
    }
    const trieu = price / 1_000_000;
    return `${Math.round(trieu)} Triệu VNĐ`;
  };

  // Render text có format cơ bản: in đậm **text**, bullet points *, xuống dòng \n
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      // Bullet point
      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("• ") || line.trim().startsWith("- ");
      const cleanLine = isBullet ? line.trim().replace(/^[\*\•\-]\s*/, "") : line;

      // Parse bold **...**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const parsedContent = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-[#E2C799]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-[#C5A880] text-xs mt-1.5">•</span>
            <div className="flex-1">{parsedContent}</div>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-1">
          {parsedContent}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. NÚT TRIGGER NỔI GÓC PHẢI DƯỚI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Bong bóng chào mời thu hút lần đầu nếu chưa mở */}
        {!isOpen && hasNewMessage && (
          <div className="mb-3 bg-[#16181D] border border-[#C5A880]/50 text-white text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Atelier Concierge vừa phản hồi Quý khách!</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Atelier VIP Concierge Chat"
          className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-full transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.7)] ${
            isOpen
              ? "bg-[#181A20] text-slate-300 border border-white/10 hover:border-white/20"
              : "bg-gradient-to-r from-[#0F1015] via-[#1A1D24] to-[#121318] text-white border border-[#C5A880]/60 hover:border-[#C5A880] hover:scale-105"
          }`}
        >
          {/* Pulsing glow ring */}
          {!isOpen && (
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#C5A880]/30 to-[#E2C799]/30 blur-sm group-hover:opacity-100 opacity-60 transition duration-500" />
          )}

          <div className="relative flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 group-hover:bg-[#C5A880] group-hover:text-black transition-colors">
              {isOpen ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {!isOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B0C0E] rounded-full" />
              )}
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
                {isOpen ? "Đóng hộp thoại" : "Atelier Concierge"}
              </span>
              {!isOpen && (
                <span className="text-[10px] text-[#C5A880]/80">Trực tuyến • Hỗ trợ 24/7</span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* 2. CỬA SỔ HỘI THOẠI LUXURY CHAT MODAL */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[82vh] flex flex-col rounded-2xl bg-[#0F1014]/95 border border-[#C5A880]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#171920] to-[#121318] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A880] to-[#8C6D45] p-[1.5px] flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-[#0E1013] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0E1013]" />
              </div>
              
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-white">
                    Atelier Concierge
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#C5A880]/20 text-[#E2C799] border border-[#C5A880]/40 font-mono">
                    VIP AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Showroom Sala Thủ Thiêm</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">Sẵn sàng phục vụ</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-md ${
                      isUser
                        ? "bg-[#C5A880] text-black font-medium rounded-tr-none"
                        : "bg-[#181B22] border border-white/10 text-slate-200 rounded-tl-none leading-relaxed"
                    }`}
                  >
                    {renderFormattedText(msg.content)}
                  </div>

                  {/* BANNER XÁC NHẬN TẠO LEAD THÀNH CÔNG */}
                  {msg.action_taken === "lead_created" && (
                    <div className="mt-2 max-w-[88%] bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2.5 text-emerald-200 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-300">Yêu cầu VIP đã được tiếp nhận</p>
                        <p className="text-[11px] text-emerald-200/80 mt-0.5">
                          Hệ thống CRM Atelier đã chuyển thông tin tới Giám đốc chăm sóc khách hàng.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CARDS GỢI Ý XE TƯƠNG TÁC INLINE */}
                  {msg.suggested_cars && msg.suggested_cars.length > 0 && (
                    <div className="mt-3 w-full space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span className="flex items-center gap-1 text-[#C5A880] font-medium">
                          <CarIcon className="w-3.5 h-3.5" /> Xe phù hợp trong kho ({msg.suggested_cars.length})
                        </span>
                        <span>Đã kiểm định 150 điểm</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggested_cars.map((car) => (
                          <Link
                            key={car.id}
                            href={`/xe/${car.slug}`}
                            target="_blank"
                            className="group flex items-center gap-3 p-2.5 rounded-xl bg-[#14161C] border border-white/5 hover:border-[#C5A880]/60 transition-all hover:bg-[#1A1D24]"
                          >
                            <div className="relative w-20 h-14 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/5">
                              {car.primary_image ? (
                                <Image
                                  src={car.primary_image}
                                  alt={car.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <CarIcon className="w-6 h-6" />
                                </div>
                              )}
                              <span className="absolute top-1 left-1 bg-black/70 text-[9px] px-1 py-0.2 rounded text-slate-300 font-mono">
                                {car.year}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white group-hover:text-[#E2C799] transition-colors truncate">
                                {car.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-[#C5A880]">
                                  {formatCarPrice(car.price)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  • {car.body_type}
                                </span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#C5A880] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.timestamp && (
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              );
            })}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-[#181B22] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-slate-400 text-xs shadow-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-slate-400 text-[11px]">Atelier Concierge đang tra cứu kho xe...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="px-3 py-2 bg-[#12141A]/90 border-t border-white/5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[10px] text-[#C5A880] flex items-center gap-1 mr-1">
                <HelpCircle className="w-3 h-3" /> Gợi ý:
              </span>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#C5A880]/15 hover:border-[#C5A880]/50 border border-white/10 text-[11px] text-slate-300 hover:text-[#E2C799] transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-[#15171F] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập nhu cầu xe, tầm giá, câu hỏi trả góp..."
                disabled={isLoading}
                className="flex-1 bg-[#0E1014] border border-white/10 focus:border-[#C5A880] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3865D] hover:from-[#D8BC94] hover:to-[#B89B72] text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:from-[#C5A880]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C5A880]" /> Dữ liệu trực tiếp từ kho xe Atelier
              </span>
              <span>Hotline VIP: 090 123 4567</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
