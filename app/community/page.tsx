import { Suspense } from "react";
import Tabview from "./components/Tabview";
import Articles from "./components/Articles";
import Notification from "@/components/Notification";
import { Metadata } from "next";
import PostSkeleton from "./components/PostsSkeleton";
import TrendingPage from "./components/Trending";
import FloatingLeaderboardButton from "./components/FloatingLeaderboardButton";

interface PageProps {
  searchParams: Promise<{ view?: string; page?: string }>
}

// Add metadata for SEO
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || 'feed';
  
  const titles = {
    feed: 'Community Feed - Latest Posts and Discussions',
    article: 'Articles - Community Insights and Stories',
    notification: 'Notifications - Stay Updated'
  };

  const descriptions = {
    feed: 'Join our vibrant community discussions. Discover latest posts, share your thoughts, and connect with like-minded people.',
    article: 'Read insightful articles from our community members. Learn, share knowledge, and explore diverse perspectives.',
    notification: 'Stay updated with community activities, replies to your posts, and new followers.'
  };

  return {
    title: titles[view as keyof typeof titles] || titles.feed,
    description: descriptions[view as keyof typeof descriptions] || descriptions.feed,
    openGraph: {
      title: titles[view as keyof typeof titles] || titles.feed,
      description: descriptions[view as keyof typeof descriptions] || descriptions.feed,
      type: 'website',
      url: `/community?view=${view}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[view as keyof typeof titles] || titles.feed,
      description: descriptions[view as keyof typeof descriptions] || descriptions.feed,
    },
    alternates: {
      canonical: `/community?view=${view}`,
    }
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || 'feed';

  return (
    <div className="pb-24 lg:pb-0">
      {/* Add proper semantic structure */}
      <header className="sr-only">
        <h1>Community {view === 'feed' ? 'Feed' : view === 'article' ? 'Articles' : 'Notifications'}</h1>
      </header>
      
      <main role="main">
        <Suspense fallback={<div className="space-y-4 p-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <PostSkeleton key={item} />
                ))}
              </div>}>
          {view === 'feed' && <Tabview />}
          {view === 'article' && <Articles/>}
          {view === 'notification' && <Notification/>}
          {view === 'trending' && <TrendingPage/>}
        </Suspense>
      </main>
      
      <FloatingLeaderboardButton />
    </div>
  );
}

export default Page;