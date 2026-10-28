import { Metadata } from "next";
import ArticleDetailClient from "./ArticleDetailClient";
import JsonLd, { generateArticleSchema, generateBreadcrumbSchema } from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-automotive.vn";

async function getPostData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/posts/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    return {
      title: "Tin Tức & Góc Nhìn Chuyên Gia | Atelier Curated Automotive",
      description: "Các bài viết chuyên sâu về siêu xe, thị trường xe sang và cẩm nang thẩm định ô tô cao cấp.",
    };
  }

  const title = post.title;
  const description = post.excerpt || "Bài viết chuyên sâu từ Atelier Curated Automotive.";
  const coverUrl = post.cover_url || `${SITE_URL}/og-news.jpg`;

  return {
    title: `${title} | Atelier Curated Automotive`,
    description,
    keywords: ["tin tức siêu xe", "kiểm định xe sang", "thị trường ô tô", post.category || "Atelier"],
    openGraph: {
      title: `${title} | Atelier Curated Automotive`,
      description,
      url: `${SITE_URL}/tin-tuc/${post.slug}`,
      siteName: "Atelier Curated Automotive",
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.published_at,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Atelier Curated Automotive`,
      description,
      images: [coverUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostData(slug);

  const articleSchema = post ? generateArticleSchema(post) : null;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Tin tức", url: "/tin-tuc" },
    { name: post ? post.title : "Chi tiết bài viết", url: `/tin-tuc/${slug}` },
  ]);

  return (
    <>
      {articleSchema && <JsonLd data={articleSchema} />}
      <JsonLd data={breadcrumbSchema} />
      <ArticleDetailClient slug={slug} />
    </>
  );
}
