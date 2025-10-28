"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Compass, LogIn, Plus, SquarePen, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import { useGetDefaultUser } from "@/features/user/use-get-default";
import { useGetUserLocationCount } from "@/features/user/use-get-locationCount";
import Link from "next/link";
import { toast } from "sonner";
import { RecentLocations } from "./RecentLocations";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading } = useAuth();
  const { data, isLoading, isError } = useGetDefaultUser();
  const { data: user_data } = useGetUserLocationCount();

  // Memoize view to prevent unnecessary recalculations
  const view = useMemo(() => searchParams.get('view') || 'feed', [searchParams]);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server or during initial mount
  if (!isMounted) return null;

  // Navigate to create post page
  const handleCreatePost = () => {
    if (user === null) {
      router.push('/login')
    }
    else {
      router.push("/create-post");
    }
  };

  const handleClick = () => {
    if (!user) {
      return toast.error("Login to view profile");
    }
    router.push('/profile');
  }

  return (
    <>
      {/* Desktop sidebar - visible on lg screens */}
      <div className="fixed left-0 top-0 h-[90vh] w-64 bg-white border-r border-t rounded-xl border-gray-200 mt-22 hidden lg:flex flex-col">
        <div className="p-4 flex-1">
          {/* Create Post Button */}
          <Button
            onClick={handleCreatePost}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>

          {/* Navigation Buttons */}
          <nav className="flex flex-col justify-center items-center space-y-2 mt-10" aria-label="Main navigation">
            <Link href="/community?view=feed" className="w-full" prefetch={true}>
              <Button
                className={`w-full transition-colors ${view === "feed"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : ""
                  }`}
                variant={view === "feed" ? "default" : "outline"}
              >
                <Compass className="mr-2 h-4 w-4" />
                Feed
              </Button>
            </Link>

            <Link href="/community?view=article" className="w-full" prefetch={true}>
              <Button
                className={`w-full transition-colors ${view === "article"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : ""
                  }`}
                variant={view === "article" ? "default" : "outline"}
              >
                <SquarePen className="mr-2 h-4 w-4" />
                Articles
              </Button>
            </Link>
            
            <Link href="/community?view=trending" className="w-full" prefetch={true}>
              <Button
                className={`w-full transition-colors ${view === "trending"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : ""
                  }`}
                variant={view === "trending" ? "default" : "outline"}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </Button>
            </Link>
          </nav>

          {/* Recent Locations */}
          <div className="mt-10">
            <RecentLocations />
          </div>
        </div>

        <div className="p-4 text-xs text-gray-500 mt-auto">
          {user ? (
            <Link href='/profile' prefetch={true}>
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
            </Link>)
            : (
              <div className="bg-black text-white rounded-2xl border border-red-600 p-4 space-y-3 shadow-md transition-all hover:shadow-red-500/20 mb-4">
                <p className="text-sm text-gray-200 leading-relaxed">
                  Log in to share your first travel experience, join the community and get $20 worth of gift.
                </p>

                <Link href="/login">
                  <button className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl transition-all">
                    <LogIn size={18} />
                    <span>Log In</span>
                  </button>
                </Link>
              </div>)}

          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <p>© 2025 SafeOrNot, Inc.</p>
          </div>
        </div>
      </div>

      {/* Floating Mobile Dock */}
      <div className="fixed bottom-0 z-50 left-0 w-full bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div className="flex justify-around items-center py-3">
          {/* Create Post Button */}
          <button
            className="flex flex-col items-center justify-center"
            onClick={handleCreatePost}
          >
            <div className="rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white p-2 shadow-md shadow-red-500/30 hover:scale-105 hover:shadow-red-500/50 transition-all duration-200">
              <Plus className="h-5 w-5" />
            </div>
          </button>

          {/* Feed Button */}
          <Link
            href="/community?view=feed"
            prefetch={true}
            className={`flex flex-col items-center justify-center text-sm pb-1 transition-colors ${view === "feed"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-primary"
              }`}
          >
            <Compass className="h-5 w-5 mb-1" />
          </Link>

          {/* Articles Button */}
          <Link
            href="/community?view=article"
            prefetch={true}
            className={`flex flex-col items-center justify-center text-sm pb-1 transition-colors ${view === "article"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-primary"
              }`}
          >
            <SquarePen className="h-5 w-5 mb-1" />
          </Link>

          {/* Trending Button */}
          <Link
            href="/community?view=trending"
            prefetch={true}
            className={`flex flex-col items-center justify-center text-sm pb-1 transition-colors ${view === "trending"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-primary"
              }`}
          >
            <TrendingUp className="h-5 w-5 mb-1" />
          </Link>

          {/* Profile Avatar */}
          <button onClick={handleClick} className="flex items-center justify-center">
            <AvatarCircle
              url={data?.userData.profile_url}
              name={data?.userData.name ?? ""}
              size="32"
            />
          </button>
        </div>
      </div>
    </>
  );
}