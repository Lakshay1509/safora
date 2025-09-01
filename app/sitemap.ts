import { db } from "@/lib/prisma";

interface Location {
  id: string;
  created_at: Date;
}

interface SitemapEntry {
  url: string;
  lastModified: string; // use ISO string
  changeFrequency?: string;
  priority?: number;
}

async function getLocationsSitemap(): Promise<Location[]> {
  try {
    return await db.locations.findMany({
      select: { id: true, created_at: true },
      take: 5000,
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch locations for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const locations = await getLocationsSitemap();

  const staticEntries: SitemapEntry[] = [
    {
      url: "https://www.safeornot.space",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://www.safeornot.space/privacy-policy",
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const locationEntries: SitemapEntry[] = locations.map((location) => ({
    url: `https://www.safeornot.space/location/${location.id}`,
    lastModified: location.created_at.toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...locationEntries];
}
