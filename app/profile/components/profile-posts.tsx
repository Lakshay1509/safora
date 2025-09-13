"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useGetUserPosts } from "@/features/user/use-get-post";
import Link from "next/link";

export function ProfilePostsCard() {
  const [userId, setUserId] = useState<string | null>(null);
  
  
  const supabase = createClient();
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);
  
  const {
      data,
      isLoading,
      isError
  } = useGetUserPosts();

  if (isLoading) {
    return (
      <Card className="w-full bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
            My Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
            My Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading posts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full  bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          My Posts ({data?.posts.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {data?.posts && data.posts.length > 0 ? (
          <ul className="space-y-2">
            {data.posts.map((post) => (
              <li key={post.id}>
                <Link href={`/post/${post.id}/${post.slug}`} className="block p-4 rounded-md bg-[#F8F4EF] hover:underline">
                    <h3 className="font-semibold text-gray-900 truncate">{post.heading}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.body}
                    </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You haven&apos;t created any posts yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
