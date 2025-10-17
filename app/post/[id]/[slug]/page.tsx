import { Metadata } from "next";
import Post from "./components/Post"
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
  const { id } = await params;
  const post = await db.posts.findUnique({
    where: { id: id },
    select: { heading: true, body: true, slug: true, image_url: true },
  });

  if (!post) {
    return { title: "Post not found | Safe or Not" };
  }

  const title = trimText(post.heading, 60);
  const description = trimText(`${post.body}. Read real experiences, safety tips, and insights about ${post.heading}`, 160);
  const ogDescription = trimText(`${post.body}. Discover safety ratings, traveler reviews, and precautions shared by the community about ${post.heading}.`, 160);
  const twitterDescription = trimText(`${post.body}. Insights, tips, and safety reviews from travelers about ${post.heading}.`, 160);

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${trimText(post.heading, 55)} | Safe or Not`,
      description: ogDescription,
      url: `https://www.safeornot.space/post/${id}/${post.slug}`,
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
    alternates: {
    canonical: `https://www.safeornot.space/post/${id}/${post.slug}`,
  },
  };

}

const page = async ({ params }: Props) => {
  const { id } = await params;

  // Fetch post data server-side
  const post = await db.posts.findUnique({
    where: { id: id },
    select: {
      heading: true,
      body: true,
      created_at: true,
      image_url: true,
      users: { select: { name: true } },
      locations: { select: { name: true } }
    },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <article className="sr-only" aria-hidden="true">
        <h1>{post.heading}</h1>
        <p>{post.body.slice(0, 300)}</p>
        <p>
          Author: {post.users?.name ?? "Anonymous"}
          Published: {post.created_at?.toISOString().split("T")[0]}
          {post.locations?.name && `Location: ${post.locations.name}`}
        </p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.heading,
          articleBody: post.body.slice(0, 500),
          author: {
            "@type": "Person",
            name: post.users?.name ?? "Unknown",
          },
          datePublished: post.created_at?.toISOString(),
          image: post.image_url ?? "https://www.safeornot.space/og.webp",
          publisher: {
            "@type": "Organization",
            name: "Safe or Not",
            logo: {
              "@type": "ImageObject",
              url: "https://www.safeornot.space/logo.avif",
            },
          },
        }),
      }} />

      <Post />
    </div>
  );
}

export default page