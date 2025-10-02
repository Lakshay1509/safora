"use client";

import { useGetPostCommunity } from "@/features/community/use-get-post-community";
import Link from "next/link";
import { Tag } from "lucide-react";
import PostStats from "@/components/PostStats";
import PostSkeleton from "./PostsSkeleton";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import PostImage from "@/components/PostImage";
import React, { useRef, useEffect } from "react";
import { LoaderOne } from "@/components/ui/loader";
import PostStatsFeed from "@/components/PostsStatsFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Posts = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostCommunity();

  const lastPostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastPostRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      // Only allow infinite scroll if user is logged in
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && user) {
        fetchNextPage();
      }
    });

    observer.observe(lastPostRef.current);

    return () => {
      if (lastPostRef.current) {
        observer.unobserve(lastPostRef.current);
      }
    };
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, user]);

  // Function to truncate text to first 2 lines
  const truncateText = (text: string, isBody: boolean = false) => {
    if (isBody) {
      // For body text, limit to first 2 lines
      const lines = text.split('\n');
      if (lines.length > 2) {
        return lines.slice(0, 2).join('\n') + '...';
      }

      // If no newlines, limit by character length (approx. 2 lines)
      if (text.length > 160) {
        return text.substring(0, 160) + '...';
      }
    }
    return text;
  };

  if (isLoading || authLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <PostSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading posts. Please try again later.
      </div>
    );
  }

  if (!data || !data.pages || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return <div className="p-4 text-center">No posts available.</div>;
  }

  // Show only first page for non-logged-in users
  const shouldShowLoginPrompt = !user && data.pages.length >= 1;

  return (
    <section className="flex flex-row justify-start ">
      <div className="flex-1 max-w-4xl">
        <div className="p-4 rounded-lg w-full">
          <div className="flex flex-col gap-4">
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.data.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border-b border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50 text-sm"
                  >
                    {/* User and location info */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      {post.users && (
                        <AvatarCircle
                          url={post?.users?.profile_url}
                          name={post?.users?.name}
                        />
                      )}

                      {post.users && (
                        <span className="font-medium mx-2">
                          {post.users.name}
                        </span>
                      )}

                      {post.created_at && (
                        <span>
                          • {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`location/${
                          post.locations?.id ? post.locations.id : ""
                        }`}
                        className="hover:underline"
                      >
                        {post.locations && (
                          <span className="mr-2 bg-blue-200 px-2 py-1 inline-flex items-center gap-1 rounded text-[10px] ">
                            <Tag size={10} />
                            <span>{post.locations.name}</span>
                          </span>
                        )}
                      </Link>
                    </div>

                    <Link
                      href={`/post/${post.id}/${post.slug}`}
                      className="block text-black hover:text-gray-500"
                    >
                      <h2 className="font-semibold text-lg">
                        {truncateText(post.heading)}
                      </h2>
                      <p className="text-gray-700 mt-2 break-words">
                        {truncateText(post.body, true)}
                      </p>
                    </Link>

                    <div className=" lg:pr-20">
                      {post.image_url && (
                        <PostImage image_url={post.image_url} />
                      )}
                    </div>

                    {/* Social interaction bar */}
                    <PostStatsFeed
                      id={post.id}
                      upvotes_count={post.upvotes}
                      comments={post._count.posts_comments}
                      upvoted={post.upvote===1 }
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Login prompt for non-authenticated users */}
          {shouldShowLoginPrompt && (
            <div className="my-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Want to see more?
                </h3>
                <p className="text-gray-600">
                  Sign in to access more posts, join discussions, and connect with the community.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => router.push('/login')}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show loader or ref for logged-in users */}
          {user && (
            <>
              <div ref={lastPostRef} />
              <div className="flex justify-center my-4 w-full">
                {isFetchingNextPage && <LoaderOne />}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
