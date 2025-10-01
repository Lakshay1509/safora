"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Compass, Navigation, Plus, SquarePen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetTrending } from "@/features/community/use-get-trending";
import TrendingCard from "./TrendingCard";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import { useGetDefaultUser } from "@/features/user/use-get-default";
import { useGetUserLocationCount } from "@/features/user/use-get-locationCount";
import Link from "next/link";
import { toast } from "sonner";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading } = useAuth();
  const { data, isLoading, isError } = useGetDefaultUser();
  const { data: user_data } = useGetUserLocationCount();

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server or during initial mount
  if (!isMounted) return null;

  const view = searchParams.get('view') || 'feed';

  // Navigate to create post page
  const handleCreatePost = () => {
    if (user === null) {
      router.push('/login')
    }
    else {
      router.push("/create-post");
    }

  };

  const handleClick =()=>{
    if(!user){
      return toast.error("Login to view profile");

    }
    router.push('/profile');
  }

  return (
    <>
      {/* Desktop sidebar - visible on lg screens */}
      <div className="fixed left-0 top-0 h-[90vh] w-64 bg-white border-r border-t rounded-xl border-gray-200 mt-22 hidden lg:flex flex-col">
        <div className="p-4 flex-1">
          <Button
            onClick={handleCreatePost}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>

          <div className="flex flex-col justify-center items-center space-y-2 mt-10">
            <Button
              className={`w-full ${view === 'feed' ? 'bg-red-600 text-white hover:bg-red-700' : ''}`}
              variant={view === 'feed' ? 'default' : 'outline'}
              onClick={() => router.push('/community?view=feed')}
            >
              <Compass /> Feed
            </Button>
            <Button
              className={`w-full ${view === 'article' ? 'bg-red-600 text-white hover:bg-red-700' : ''}`}
              variant={view === 'article' ? 'default' : 'outline'}
              onClick={() => router.push('/community?view=article')}
            >
              <SquarePen /> Articles
            </Button>
          </div>
        </div>


        <div className="p-4 text-xs text-gray-500 mt-auto">
          {user &&
          <Link href='/profile' >
           <div className="flex items-center space-x-3 mb-4 hover:bg-gray-300 transition-all rounded-2xl p-3">
            {/* Avatar */}
            <AvatarCircle url={data?.userData.profile_url} name={data?.userData.name ?? ''} />

            {/* User Info */}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{data?.userData.name}</span>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span className="font-semibold">{data?.userData.following_locations_count}</span>
                <span>following</span>
                <span className="mx-1">•</span>
                <span className="font-semibold">{user_data?.count}</span>
                <span>visited</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
          </Link>
          }

          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <p>© 2025 SafeOrNot, Inc.</p>
          </div>
        </div>
      </div>

      {/* Mobile floating button - visible on sm/md screens */}


      {/* Floating Mobile Dock */}
      <div className="fixed bottom-0 z-50 left-0 w-full bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div className="flex justify-around items-center py-2">
          <button className="flex flex-col items-center text-xs rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white p-2  shadow-md shadow-red-500/30 hover:scale-105 hover:shadow-red-500/50 transition-all duration-200" onClick={handleCreatePost}>
            <Plus className="h-6 w-6 mb-0.5" />
            
          </button>
          <button
            className={`flex flex-col items-center text-sm pb-1 ${view === 'feed' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-primary'}`}
            onClick={() => router.push('/community?view=feed')}
          >
            <Compass className="h-6 w-6 mb-1" />
            
          </button>
          <button
            className={`flex flex-col items-center text-sm pb-1 ${view === 'article' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-primary'}`}
            onClick={() => router.push('/community?view=article')}
          >
            <SquarePen className="h-6 w-6 mb-1" />
            
          </button>
          <button onClick={handleClick}>
             <AvatarCircle url={data?.userData.profile_url} name={data?.userData.name ?? ''} size="40"/>
            
          </button>
        </div>
      </div>


    </>
  );
}