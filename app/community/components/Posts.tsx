"use client"

import { useGetPostCommunity } from "@/features/community/use-get-post-community"
import Link from "next/link"
import { ArrowUp, MessageCircle, Share, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import PostStats from "@/components/PostStats"
import RightSidebar from "./RightSidebar"
import PostSkeleton from "./PostsSkeleton"

export const Posts = () => {
  const { data, isLoading, isError } = useGetPostCommunity();

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

  if (isLoading) {
    return(
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <PostSkeleton key={item} />
      ))}
    </div>)
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Error loading posts. Please try again later.</div>;
  }

  if (!data || !data.posts || data.posts.length === 0) {
    return <div className="p-4 text-center">No posts available.</div>;
  }

  return (
    <section className="flex flex-row justify-start w-full">
      <div className="flex-1 max-w-4xl">
        <div className="p-4 rounded-lg w-full">
          <div className="flex flex-col gap-4">
            {data.posts.map((post) => (
              <div key={post.id} className="p-4 border-b border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50 text-sm">
                {/* User and location info */}
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  {post.users && (
                    <span className="font-medium mr-2">
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
                  <Link href={`location/${post.locations?.id ? post.locations.id : ''}`} className="hover:underline">
                    {post.locations && (
                      <span className="mr-2 bg-blue-200 px-2 py-1 inline-flex items-center gap-1 rounded text-[10px] ">
                        <Tag size={10} />
                        <span>{post.locations.name}</span>
                      </span>
                    )}
                  </Link>
                </div>


                <Link
                  href={`/post/${post.id}`}
                  className="block text-black hover:text-gray-500"
                >
                  <h2 className="font-semibold text-lg">{truncateText(post.heading)}</h2>
                  <p className="text-gray-700 mt-2 break-words">{truncateText(post.body, true)}</p>
                </Link>

                {/* Social interaction bar */}
                <PostStats id={post.id}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-80 p-4">
        <RightSidebar/>
      </div>
    </section>
  )
}
