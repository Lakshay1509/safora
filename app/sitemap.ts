import { db } from "@/lib/prisma";

interface Location {
  id: string;
  created_at: Date;
}

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency?: string;
  priority?: number;
}

async function getLocationsSitemap(): Promise<Location[]> {
  try {
    const locations = await db.locations.findMany({
      select: {
        id: true,
        created_at: true
      },
      take: 5000, // Reasonable limit
      orderBy: {
        created_at: 'desc'
      }
    });
    return locations;
  } catch (error) {
    console.error('Failed to fetch locations for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const locations = await getLocationsSitemap();
  
  const locationEntries: SitemapEntry[] = locations.map((location) => ({
    url: `https://www.safeornot.space/location/${location.id}`,
    lastModified: location.created_at,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [
    {
      url: 'https://www.safeornot.space',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    ...locationEntries
  ];
}
