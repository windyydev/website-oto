import { Metadata } from "next";
import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";
import JsonLd, { generateCarProductSchema, generateBreadcrumbSchema } from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-automotive.vn";

async function getCarData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/cars/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarData(slug);

  if (!car) {
    return {
      title: "Chi Tiết Xe | Atelier Curated Automotive",
      description: "Xem hồ sơ kỹ thuật chi tiết của các siêu xe, xe thể thao và xe sang lướt tại Atelier.",
    };
  }

  const primaryImage =
    car.images?.find((img: any) => img.is_primary)?.image_url ||
    car.images?.[0]?.image_url ||
    `${SITE_URL}/og-car.jpg`;

  const title = `${car.name} (${car.year})`;
  const description =
    car.description ||
    `${car.name} năm ${car.year}, ODO ${car.odo_km?.toLocaleString()} km. Chuẩn kiểm định 150 điểm tại Atelier Curated Automotive.`;

  return {
    title: `${title} | Atelier Curated Automotive`,
    description,
    keywords: [
      car.name,
      car.brand?.name || "xe sang",
      car.body_type,
      "mua bán siêu xe",
      "xe lướt nguyên bản",
      "Atelier Automotive",
    ].filter(Boolean),
    openGraph: {
      title: `${title} | Atelier Curated Automotive`,
      description,
      url: `${SITE_URL}/xe/${car.slug}`,
      siteName: "Atelier Curated Automotive",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: car.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Atelier Curated Automotive`,
      description,
      images: [primaryImage],
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const car = await getCarData(slug);

  const carSchema = car ? generateCarProductSchema(car) : null;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Bộ sưu tập xe", url: "/xe" },
    { name: car ? car.name : "Chi tiết xe", url: `/xe/${slug}` },
  ]);

  return (
    <>
      {carSchema && <JsonLd data={carSchema} />}
      <JsonLd data={breadcrumbSchema} />
      <CarDetailClient slug={slug} />
    </>
  );
}
