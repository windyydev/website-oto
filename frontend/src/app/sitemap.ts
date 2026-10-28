import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-automotive.vn";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/xe`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dich-vu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ve-chung-toi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/yeu-thich`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/so-sanh`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  let carRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/cars?page_size=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.items && Array.isArray(data.items)) {
        carRoutes = data.items.map((car: { slug: string; updated_at?: string }) => ({
          url: `${baseUrl}/xe/${car.slug}`,
          lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.85,
        }));
      }
    }
  } catch {
    // Fallback if backend is not reachable at build time
  }

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/posts`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) {
        postRoutes = posts.map((post: { slug: string; published_at?: string }) => ({
          url: `${baseUrl}/tin-tuc/${post.slug}`,
          lastModified: post.published_at ? new Date(post.published_at) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.65,
        }));
      }
    }
  } catch {
    // Fallback if backend is not reachable at build time
  }

  return [...staticRoutes, ...carRoutes, ...postRoutes];
}
