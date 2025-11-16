import { Metadata } from "next";
import Post from "./components/Post"
import { db } from "@/lib/prisma";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

type Props = {
  params: Promise<{ id: string }>;
};

// Define the post data type
type PostData = {
  post: {
    id: string;
    heading: string;
    body: string;
    created_at: Date | null;
    image_url: string | null;
    user_id: string;
    location_id: string | null;
    slug: string;
    upvotes: number;
    users: {
      name: string;
      profile_url: string | null;
      profile_color: string | null;
      verified: boolean;
    } | null;
    locations: {
      name: string;
    } | null;
    _count: {
      posts_comments: number;
    };
  };
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
    keywords: `${post.heading}, safety, travel, community reviews`,
    robots: {
      index: true,
      follow: true,
    },
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

  // Create a new QueryClient for this request
  const queryClient = new QueryClient();

  // Prefetch the post data for TanStack Query
  await queryClient.prefetchQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const post = await db.posts.findUnique({
        where: { id: id },
        select: {
          id: true,
          heading: true,
          body: true,
          created_at: true,
          image_url: true,
          user_id: true,
          location_id: true,
          slug: true,
          upvotes: true,
          users: { 
            select: { 
              name: true,
              profile_url: true,
              profile_color: true,
              verified: true,
            } 
          },
          locations: { select: { name: true } },
          _count: {
            select: {
              posts_comments: true,
            },
          },
        },
      });
      
      if (!post) throw new Error('Post not found');
      
      return { post };
    },
  });

  const dehydratedState = dehydrate(queryClient);
  
  // Get the post data with proper typing
  const postData = queryClient.getQueryData<PostData>(['post', id]);

  return (
    <HydrationBoundary state={dehydratedState}>
      {/* Enhanced JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: postData?.post.heading,
          articleBody: postData?.post.body,
          description: postData?.post.body.slice(0, 160),
          author: {
            "@type": "Person",
            name: postData?.post.users?.name ?? "Anonymous",
          },
          datePublished: postData?.post.created_at?.toISOString(),
          dateModified: postData?.post.created_at?.toISOString(),
          image: postData?.post.image_url ?? "https://www.safeornot.space/og.webp",
          publisher: {
            "@type": "Organization",
            name: "Safe or Not",
            logo: {
              "@type": "ImageObject",
              url: "https://www.safeornot.space/logo.avif",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.safeornot.space/post/${id}/${postData?.post.slug}`,
          },
        }),
      }} />

      {/* The Post component will render with hydrated data - fully visible to Google */}
      <Post />
    </HydrationBoundary>
  );
}

export default page;