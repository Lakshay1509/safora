import { Metadata } from "next";
import Article from "./Article"
import { db } from "@/lib/prisma";


type Props = {
  params: Promise<{ id: string }>;
};

// Helper function to trim text to specified length
function trimText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const {id} = await params;
  const post = await db.posts.findUnique({
    where: { id: id },
    select: { heading: true,body:true,slug:true,image_url:true },
  });

  if (!post) {
    return { title: "Post not found | Safe or Not" };
  }

  const title = trimText(`${post.heading} - Safety Review`, 60);
  const description = trimText(`${post.body}. Read real experiences, safety tips, and insights about ${post.heading}`, 160);
  const ogDescription = trimText(`${post.body}. Discover safety ratings, traveler reviews, and precautions shared by the community about ${post.heading}.`, 160);
  const twitterDescription = trimText(`${post.body}. Insights, tips, and safety reviews from travelers about ${post.heading}.`, 160);

  return {
  title: title,
  description: description,
  openGraph: {
    title: `${trimText(post.heading, 55)} | Safe or Not`,
    description: ogDescription,
    url: `https://www.safeornot.space/article/${id}/${post.slug}`,
    siteName: "Safe or Not",
    images: [
      {
        url: post.image_url ?? "/og.webp",
        width: 1200,
        height: 630,
        alt: trimText(`${post.heading} - Safe or Not`, 100),
      },
    ],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${trimText(post.heading, 55)} | Safe or Not`,
    description: twitterDescription,
    images: [post.image_url ?? "/og.webp"],
  },
};

}
const page = () => {
  return (
   
   <Article/>
   
  )
}

export default page