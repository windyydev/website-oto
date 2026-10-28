"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_url?: string;
  category?: string;
  published_at: string;
}

export default function NewsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts/")
      .then((res) => {
        setPosts(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[var(--bg-app)] min-h-screen text-[var(--text-primary)] pb-24">
      {/* Hero Header */}
      <div className="bg-[#121316] text-[#FBFBFA] py-20 border-b border-[#2f3130]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[var(--brand-gold)] uppercase tracking-[0.2em] block">
            Atelier Editorial
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold text-white tracking-tight">
            Tin Tức & Góc Nhìn Chuyên Gia
          </h1>
          <p className="text-sm text-[#dadad9] max-w-xl font-light leading-relaxed">
            Những bài viết chuyên sâu về kỹ thuật cơ khí, trải nghiệm siêu xe thực tế và phân tích xu hướng giá trị thị trường xe sang.
          </p>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 pt-16">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs text-[var(--text-secondary)] mt-2 block">Đang tải bài viết...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center text-sm text-[var(--text-secondary)]">
            Hiện tại chưa có bài viết nào được xuất bản.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] rounded-xl overflow-hidden transition duration-300 flex flex-col shadow-xs hover:shadow-md"
              >
                {/* Cover Image */}
                <Link href={`/tin-tuc/${post.slug}`} className="aspect-[16/10] overflow-hidden bg-[var(--surface-mid)] relative block">
                  <img
                    src={post.cover_url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-gold)] border border-[var(--brand-gold)]/30">
                      {post.category}
                    </span>
                  )}
                </Link>

                {/* Article Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <Link href={`/tin-tuc/${post.slug}`}>
                      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--brand-gold)] transition line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-gold)] group-hover:translate-x-1 transition-transform">
                    <span>Đọc toàn bộ bài viết</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
