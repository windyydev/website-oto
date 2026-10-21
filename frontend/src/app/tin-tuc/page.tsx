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

export default function NewsPage() {
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
    <div className="bg-[#FBFBFA] min-h-screen text-[#121316] pb-24">
      {/* Hero Header */}
      <div className="bg-[#121316] text-[#FBFBFA] py-20 border-b border-[#2f3130]">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 space-y-4">
          <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
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
            <div className="w-8 h-8 border-2 border-[#9E7D53] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs text-[#66686B] mt-2 block">Đang tải bài viết...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center text-sm text-[#66686B]">
            Hiện tại chưa có bài viết nào được xuất bản.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white border border-[#EAEAE7] hover:border-[#9E7D53] rounded-xl overflow-hidden transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  <Link href={`/tin-tuc/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-[#F4F4F2]">
                    <img
                      src={post.cover_url || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#66686B]">
                      <span className="text-[#9E7D53] font-semibold uppercase tracking-wider">
                        {post.category || "Tin Tức"}
                      </span>
                      <span>{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <Link href={`/tin-tuc/${post.slug}`}>
                      <h2 className="text-lg font-display font-semibold text-[#121316] group-hover:text-[#9E7D53] transition line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-[#66686B] line-clamp-3 leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/tin-tuc/${post.slug}`}
                    className="text-xs font-semibold text-[#121316] group-hover:text-[#9E7D53] transition flex items-center gap-1.5"
                  >
                    <span>Đọc toàn bộ bài viết</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#9E7D53]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
