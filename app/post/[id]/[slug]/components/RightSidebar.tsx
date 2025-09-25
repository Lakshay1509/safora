"use client"

import { useGetLocation } from "@/features/location/use-get-location"
import { useGetLocationStats } from "@/features/location/use-get-location-stats";
import { useGetLocationPost } from "@/features/post/use-get-by-locationId";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props{
    id:string
}

const RightSidebar = ({id}:Props) => {
    const {data,isLoading,isError} = useGetLocation(id); 
    const{data:stats,isLoading:stats_loading,isError:stats_error} = useGetLocationStats(id);
    const { data:post, isLoading:post_Loading, isError:post_error } = useGetLocationPost(id);
  return (
    <div className="fixed right-0 top-0 h-[90vh] w-80 bg-white border-l border-t border-r rounded-xl border-gray-200 mt-22 mr-4 py-10 px-6 hidden lg:block overflow-y-auto">

      <Link href={`/location/${data?.location.id}`} className="hover:underline">
        <h2 className="flex items-center gap-x-2 text-xl  font-semibold">
            {data?.location.name}
          </h2>

          <div className="text-black ">
            <span className="text-sm sm:text-base">{data?.location.country}, {data?.location.city}</span>
          </div>

          <div className=" flex items-center space-x-2 text-gray-700 text-sm font-medium">
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.followers?.followers_count}</span>
              <span className="text-gray-500">Followers</span>
            </p>
            <div className="h-4 w-px bg-gray-300"></div>
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.posts}</span>
              <span className="text-gray-500">Posts</span>
            </p>
            <div className="h-4 w-px bg-gray-300"></div>
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.comments}</span>
              <span className="text-gray-500">Comments</span>
            </p>
          </div>
        </Link>

        <div className="mt-10">
          <h1 className="font-semibold flex items-center mb-4">More posts <ArrowRight size={16} className="ml-1"/></h1>
          
          {post_Loading ? (
            <div className="text-sm text-gray-500">Loading posts...</div>
          ) : post_error ? (
            <div className="text-sm text-red-500">Error loading posts</div>
          ) : post?.post && post.post.length > 0 ? (
            <div className="space-y-4">
              {post.post.slice(0, 5).map((item) => (
                
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <Link href={`/post/${item.id}/${item.slug}`}>
                  <h3 className="font-medium text-sm line-clamp-2">{item.heading}</h3>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{item.upvotes} upvotes</span>
                  
                  </div>
                  </Link>
                </div>
                
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No posts available</div>
          )}
        </div>

    </div>
  )
}

export default RightSidebar