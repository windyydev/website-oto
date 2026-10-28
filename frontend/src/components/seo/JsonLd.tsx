import React from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-automotive.vn";

export function generateAutoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "Atelier Curated Automotive",
    description: "Showroom siêu xe, xe thể thao và xe sang lướt tuyển chọn chuẩn kiểm định 160 điểm độc lập tại Việt Nam.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: "090 123 4567",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Khu đô thị Sala, Mai Chí Thọ, Phường An Lợi Đông",
      addressLocality: "Thành phố Thủ Đức, TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "10.7725",
      longitude: "106.7214",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:30",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  };
}

export function generateCarProductSchema(car: {
  name: string;
  slug: string;
  description?: string;
  price?: number;
  year?: number;
  brand?: { name: string };
  odo_km?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  images?: Array<{ image_url: string }>;
  vin?: string;
  condition?: string;
}) {
  const images = car.images?.map((img) => img.image_url) || [];
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.name,
    description: car.description || `${car.name} năm ${car.year} tại Atelier Curated Automotive.`,
    image: images.length > 0 ? images : [`${SITE_URL}/og-car.jpg`],
    url: `${SITE_URL}/xe/${car.slug}`,
    vehicleIdentificationNumber: car.vin || undefined,
    itemCondition: car.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    modelDate: car.year?.toString(),
    brand: {
      "@type": "Brand",
      name: car.brand?.name || "Automotive",
    },
    mileageFromOdometer: car.odo_km
      ? {
          "@type": "QuantitativeValue",
          value: car.odo_km,
          unitCode: "KMT",
        }
      : undefined,
    fuelType: car.fuel_type || undefined,
    vehicleTransmission: car.transmission || undefined,
    bodyType: car.body_type || undefined,
    offers: {
      "@type": "Offer",
      price: car.price || 0,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/xe/${car.slug}`,
      seller: {
        "@type": "AutoDealer",
        name: "Atelier Curated Automotive",
      },
    },
  };
}

export function generateArticleSchema(post: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_url?: string;
  published_at?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_url || `${SITE_URL}/og-news.jpg`,
    datePublished: post.published_at || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Atelier Curated Automotive Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Atelier Curated Automotive",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/tin-tuc/${post.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
