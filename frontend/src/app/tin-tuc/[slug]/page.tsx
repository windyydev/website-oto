"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, ArrowLeft, Share2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url?: string;
  category?: string;
  published_at: string;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        console.error(err);
        notFound();
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center gap-3 bg-[#FBFBFA]">
        <div className="w-8 h-8 border-2 border-[#9E7D53] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#66686B]">Đang tải nội dung bài viết...</span>
      </div>
    );
  }

  if (!post) return notFound();

  return (
    <article className="bg-[#FBFBFA] min-h-screen pb-24 text-[#121316]">
      {/* Breadcrumb */}
      <div className="bg-[#F4F4F2] border-b border-[#EAEAE7] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-[#66686B]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#121316] transition">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-[#E2E2DF]" />
            <Link href="/tin-tuc" className="hover:text-[#121316] transition">Tin tức</Link>
            <ChevronRight className="w-3 h-3 text-[#E2E2DF]" />
            <span className="text-[#121316] font-medium truncate max-w-xs">{post.title}</span>
          </div>
          <Link href="/tin-tuc" className="flex items-center gap-1 hover:text-[#121316] transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả bài viết</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-0.5 rounded bg-[#121316] text-[#9E7D53] font-semibold uppercase tracking-wider text-[10px]">
              {post.category || "Bài Viết"}
            </span>
            <span className="text-[#66686B]">
              Xuất bản ngày {new Date(post.published_at).toLocaleDateString("vi-VN")}
            </span>
            <span>•</span>
            <span className="text-[#66686B]">Ban Biên Tập Atelier Curated</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-[#121316] leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-base text-[#66686B] font-light italic leading-relaxed border-l-2 border-[#9E7D53] pl-4">
            {post.excerpt}
          </p>
        </div>

        {/* Cover Image */}
        {post.cover_url && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#EAEAE7] shadow-md">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <div
          className="prose prose-zinc max-w-none text-sm sm:text-base leading-relaxed text-[#1F2124] space-y-4 font-light"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer info & Return */}
        <div className="pt-8 border-t border-[#EAEAE7] flex items-center justify-between text-xs text-[#66686B]">
          <span>© Atelier Curated Automotive Magazine</span>
          <Link
            href="/tin-tuc"
            className="px-4 py-2 bg-[#121316] text-white rounded font-semibold text-xs hover:bg-[#9E7D53] transition"
          >
            Quay lại danh sách tin
          </Link>
        </div>
      </div>
    </article>
  );
}
