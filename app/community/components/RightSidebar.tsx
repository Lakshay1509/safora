"use client"

import { useAuth } from "@/contexts/AuthContext";
import { useGetFollowingPost } from "@/features/community/use-get-post-folllowing";
import { ArrowRight } from "lucide-react";
import Link from "next/link";



const RightSidebar = () => {
   
    const {data,isLoading,isError} = useGetFollowingPost({ limit: "10" });
    const {user,loading} = useAuth();

    
  return (
    <div className="fixed right-0 top-0 h-[90vh] w-70 bg-white border-l border-t border-r rounded-xl border-gray-200 mt-22 mr-4 py-10 px-6 hidden lg:block overflow-y-auto">

        <h1 className="font-bold ">Recent's from your following</h1>

        {user &&  <div className="mt-8 space-y-2">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {isError && <p className="text-sm text-red-500">Error loading posts</p>}
          {data?.posts && data.posts.length === 0 && (
            <p className="text-sm text-gray-500">No posts from your following</p>
          )}
          {data?.posts && data.posts.map((post, index) => (
            
            <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                <Link href={`/post/${post.id}`} className="hover:underline ">
              <h3 className="text-sm font-medium truncate">{post.heading}</h3>
              <p className="text-sm text-gray-500 truncate">{post.body}</p>
              </Link>
            </div>
            
          ))}
        </div>}

        {!user && <h1 className="mt-8">Login to explore more !</h1>}
      
    </div>
  )
}

export default RightSidebar