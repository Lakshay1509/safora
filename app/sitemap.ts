import { db } from "@/lib/prisma";

interface Location {
  id: string;
  created_at: Date;
  name:string
}

interface Posts{
  id:string,
  created_at:Date|null,
  heading:string,
  body:string,
  upvotes:number,
  slug:string|null
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
      select: { id: true, created_at: true ,name:true },
      take: 5000,
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch locations for sitemap:", error);
    return [];
  }
}

async function getPostsSitemap(): Promise<Posts[]>{

  try{
    return await db.posts.findMany({
      select:{id:true,created_at:true,heading:true,body:true,upvotes:true,slug:true}
    })
  }
  catch(error){
    console.error("Failed to get posts for sitemap",error);
    return []
  }
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const locations = await getLocationsSitemap();
  const posts = await getPostsSitemap();

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

  const postEntries : SitemapEntry[] =posts.map((post)=>({
    url :`https://www.safeornot.space/post/${post.id}/${post.slug}`,
    lastModified:(post.created_at ?? new Date()).toISOString(),
    changeFrequency:"weekly",
    priority:0.8,

  }));

  return [...staticEntries, ...locationEntries,...postEntries];
}
