"use client";

import { useGetPostCommunity } from "@/features/community/use-get-post-community";
import Link from "next/link";
import { Tag } from "lucide-react";
import PostSkeleton from "./PostsSkeleton";
import PostImage from "@/components/PostImage";
import React, { useRef, useEffect } from "react";
import { LoaderOne } from "@/components/ui/loader";
import PostStatsFeed from "@/components/PostsStatsFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LinkPreview } from "@/components/LinkPreview";
import { headingsPlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import { extractUrls } from "@/lib/url-utils";
import Image from "next/image";
import ProfileLogo from "@/components/ProfileLogo";

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

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && user) {
          fetchNextPage();
        }
      },
      {
        // Trigger when element is 600px away from viewport
        rootMargin: '600px',
      }
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, user]);

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

  const shouldShowLoginPrompt = !user && data.pages.length >= 1;

  return (
    <section className="flex flex-row justify-start ">
      <div className="flex-1 max-w-4xl">
        <div className="p-4 rounded-lg w-full">
          <div className="flex flex-col gap-4">
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.data.map((post, index) => {
                  const urls = extractUrls(post.body);
                  const isLastPage = i === data.pages.length - 1;
                  const isNearEnd = index === page.data.length - 5; // 5th from last post

                  return (
                    <div
                      key={post.id}
                      ref={isLastPage && isNearEnd ? observerRef : null}
                      className="p-4 border-b border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50 text-sm"
                    >
                      {/* User and location info */}
                      <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                        {post.users && (
                          <>
                            <ProfileLogo
                              url={post?.users?.profile_url}
                              name={post?.users?.name}
                              color={post.users?.profile_color ?? ''}
                              size="35"
                            />
                          </>
                        )}

                        <div
                          className="font-medium text-[14px]"
                          style={{
                            color: post?.users?.profile_color || '#000000'
                          }}
                        >
                          {post?.users?.name}
                        </div>

                        {post?.users?.verified && <div>
                          <Image src="/badge.svg" alt="badge" height={13} width={13} />
                        </div>}

                        {post.created_at && (
                          <div className="text-gray-500 text-xs">
                            • {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>


                      <div>
                        <Link
                          href={`location/${post.locations?.id ? post.locations.id : ""
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
                        <h2 className="font-semibold text-lg line-clamp-2">
                          {post.heading}
                        </h2>
                        <div className="text-gray-700 mt-2 text-[15px] line-clamp-4">
                          <MDXEditor markdown={post.body} readOnly={true} plugins={[

                            headingsPlugin(),
                            listsPlugin(),
                            quotePlugin(),
                            thematicBreakPlugin(),
                            markdownShortcutPlugin(),
                            linkPlugin(),
                            linkDialogPlugin(),
                          ]} />

                        </div>
                      </Link>

                      {/* Show link previews */}
                      {post.image_url === null && urls.length > 0 && (
                        <div className="mt-3">
                          {urls.slice(0, 1).map((url, index) => (
                            <LinkPreview key={index} url={url} />
                          ))}
                        </div>
                      )}

                      <div className=" lg:pr-20">
                        {post.image_url && (
                          <PostImage image_url={post.image_url} />
                        )}
                      </div>

                      <PostStatsFeed
                        id={post.id}
                        upvotes_count={post.upvotes}
                        comments={post._count.posts_comments}
                        upvoted={post.upvote === 1}
                        slug={post.slug ?? ''}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

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

          {user && (
            <div className="flex justify-center my-4 w-full">
              {isFetchingNextPage && <LoaderOne />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
