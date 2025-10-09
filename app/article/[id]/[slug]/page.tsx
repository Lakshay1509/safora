
import { Metadata } from "next";
import Article from "./Article"
import { db } from "@/lib/prisma";


type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const {id} = await params;
  const post = await db.posts.findUnique({
    where: { id: id },
    select: { heading: true,body:true,slug:true },
  });

  if (!post) {
    return { title: "Post not found | Safe or Not" };
  }

  return {
  title: `${post.heading} - Safety Review`,
  description: `${post.body}. Read real experiences, safety tips, and insights about ${post.heading}`,
  openGraph: {
    title: `${post.heading} | Safe or Not`,
    description: `${post.body}. Discover safety ratings, traveler reviews, and precautions shared by the community about ${post.heading}.`,
    url: `https://www.safeornot.space/article/${id}/${post.slug}`,
    siteName: "Safe or Not",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: `${post.heading} - Safe or Not`,
      },
    ],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${post.heading} | Safe or Not`,
    description: `${post.body}. Insights, tips, and safety reviews from travelers about ${post.heading}.`,
    images: ["/og.webp"],
  },
};

}
const page = () => {
  return (
   
   <Article/>
   
  )
}

export default page