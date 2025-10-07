"use client"

import { useAuth } from "@/contexts/AuthContext";
import { useGetFollowingPost } from "@/features/community/use-get-post-folllowing";
import { useGetTrending } from "@/features/community/use-get-trending";
import { ArrowRight } from "lucide-react";
import Link from "next/link";



const RightSidebar = () => {

  const { data, isLoading, isError } = useGetFollowingPost({ limit: "10" });
  const { data: trending_data, isLoading: trending_loading } = useGetTrending();
  const { user, loading } = useAuth();

  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 35%)`;
    return color;
  }

  // Component: circular initials badge
  function LocationBadge({ name }: { name: string }) {
    const color = stringToColor(name);
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold text-xs shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }


  return (
    <div className="fixed right-0 top-0 h-[90vh] w-70 bg-white border-l border-t border-r rounded-xl border-gray-200 mt-22  py-10 px-6 hidden lg:block overflow-y-auto">

      {user && <h1 className="font-bold ">Recent's from your following</h1>}
      {!user && <h1 className="font-bold ">Trending Locations</h1>}

      {user && <div className="mt-8 space-y-2">
        {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
        {isError && <p className="text-sm text-red-500">Error loading posts</p>}
        {data?.posts && data.posts.length === 0 && (
          <p className="text-sm text-gray-500">No posts from your following</p>
        )}
        {data?.posts && data.posts.map((post, index) => (

          <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
            <Link href={`/post/${post.id}/${post.slug}`} className="hover:underline ">
              <h3 className="text-sm font-medium truncate">{post.heading}</h3>
              <p className="text-sm text-gray-500 truncate">{post.body}</p>
            </Link>
          </div>

        ))}
      </div>}

      {!user && <div className="mt-4 space-y-2">
        {trending_loading && <p className="text-sm text-gray-500">Loading...</p>}


        {trending_data?.result && trending_data.result.map((location, index) => (

          <Link
            key={location.location_name}
            href={`/location/${location.location_id}`}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LocationBadge name={location.location_name ?? ''} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {location.location_name}
              </p>
              <p className="text-xs text-gray-500">
                  {location.review_count + Number(location.reviews1)} reviews
              </p>

            </div>
          </Link>

        ))}
      </div>}

    </div>
  )
}

export default RightSidebar