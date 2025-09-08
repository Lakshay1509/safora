"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetTrending } from "@/features/community/use-get-trending";
import TrendingCard from "./TrendingCard";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const {user,loading} = useAuth();
  const {data,isLoading,isError} = useGetTrending();

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server or during initial mount
  if (!isMounted) return null;

  // Navigate to create post page
  const handleCreatePost = () => {
    if(user===null){
      router.push('/login')
    }
    else{
      router.push("/create-post");
    }
    
  };

  return (
    <>
      {/* Desktop sidebar - visible on lg screens */}
      <div className="fixed left-0 top-0 h-[90vh] w-64 bg-white border-r border-t rounded-xl border-gray-200 mt-22 hidden lg:block">
        <div className="p-4">
          <Button 
            onClick={handleCreatePost}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
          {/* Add other sidebar items here */}
          <div className="mt-10">
           
            <h1 className="font-bold text-center flex items-center justify-center gap-1">
              Trending Places
              <ArrowUpRight size={16}/>
            </h1>
            <div className="mt-4 space-y-4">
              {isLoading && <p className="text-center text-sm">Loading trending places...</p>}
              {isError && <p className="text-center text-sm text-red-500">Could not load trending places.</p>}
              {data?.locations?.map((location) => {
                if (location.location_id) {
                  return <TrendingCard key={location.location_id} id={location.location_id} />;
                }
                return null;
              })}
            </div>
            
          </div>
        </div>
        
      </div>

      {/* Mobile floating button - visible on sm/md screens */}
      <div className="fixed right-6 bottom-20 lg:hidden">
        <Button 
          onClick={handleCreatePost}
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}