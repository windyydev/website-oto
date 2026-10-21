"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, ArrowUpRight } from "lucide-react";
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

export default function LatestNewsSection() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api
      .get("/posts/")
      .then((res) => {
        setPosts((res.data || []).slice(0, 3));
      })
      .catch((err) => console.error(err));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-[#FBFBFA]">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#EAEAE7]">
          <div>
            <span className="text-[11px] font-semibold text-[#9E7D53] uppercase tracking-[0.2em] block">
              Editorial & Insights
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#121316] tracking-tight mt-1">
              Góc Nhìn & Trải Nghiệm Xe
            </h2>
          </div>
          <Link
            href="/tin-tuc"
            className="text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#9E7D53] transition flex items-center gap-1.5"
          >
            <span>Đọc tất cả bài viết</span>
            <ArrowRight className="w-4 h-4 text-[#9E7D53]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col justify-between bg-white border border-[#EAEAE7] hover:border-[#9E7D53] rounded-lg overflow-hidden transition shadow-sm"
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
                    <h3 className="text-base font-display font-semibold text-[#121316] group-hover:text-[#9E7D53] transition line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#66686B] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/tin-tuc/${post.slug}`}
                  className="text-xs font-semibold text-[#121316] group-hover:text-[#9E7D53] transition flex items-center gap-1.5"
                >
                  <span>Đọc tiếp</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9E7D53]" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
