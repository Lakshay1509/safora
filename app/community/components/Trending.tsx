"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MapPin, Sun, Moon, MessageSquare, ArrowUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useGetTrendingPage } from "@/features/community/use-get-trendingPage";
import ProfileLogo from "@/components/ProfileLogo";
import { headingsPlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import RightSidebar from "./RightSidebar";

export default function TrendingPage() {
  const { data, isLoading, isError } = useGetTrendingPage();

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Failed to load trending data</p>
      </div>
    );
  }

  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 35%)`;
    return color;
  }

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
        className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-sm shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-start w-full bg-background">
      <div className="container max-w-4xl flex-1 mr-auto px-4 py-2 space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trending</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Discover what's popular in your community</p>
        </div>

        {/* Top Locations Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top Locations</h2>
          </div>

          {isLoading ? (
            <div className="flex gap-3 overflow-x-scroll pb-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-56 rounded-xl flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-scroll pb-2 scrollbar-hide">
              {data?.locations.map((location) => (
                <Link
                  key={location.location_id}
                  href={`/location/${location.location_id}`}
                  className="flex-shrink-0"
                >
                  <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer w-56 border-border/40">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <LocationBadge name={location.name ?? ''} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {location.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {location.total_reviews} reviews
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {location.day_rating !== null && (
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                              <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                              <span className="font-semibold text-xs text-amber-700 dark:text-amber-300">
                                {location.day_rating}%
                              </span>
                            </div>
                          )}
                          {location.night_rating !== null && (
                            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full">
                              <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span className="font-semibold text-xs text-indigo-700 dark:text-indigo-300">
                                {location.night_rating}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Posts Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Most Engaging Posts
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(20)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="">
              {data?.posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}/${post.slug}`}>
                  <Card className=" cursor-pointer mb-4">
                    <CardContent className="md:p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                        {/* Profile Section */}
                        <div className="flex flex-row items-center gap-3 md:flex-col md:items-center md:gap-1 md:w-[100px]">
                          <ProfileLogo
                            name={post.users?.name ?? ''}
                            url={post.users?.profile_url ?? ''}
                            color={post.users?.profile_color ?? ''}
                            size='40'
                          />
                          <span className="text-sm text-center line-clamp-1 md:line-clamp-2">
                            {post.users?.name}
                          </span>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 space-y-2 md:space-y-3">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base md:text-lg line-clamp-2 mb-1 md:mb-2">
                                {post.heading}
                              </h3>


                              <MDXEditor markdown={post.body} readOnly={true} plugins={[
                                linkPlugin(),
                                linkDialogPlugin(),
                                headingsPlugin(),
                                listsPlugin(),
                                quotePlugin(),
                                thematicBreakPlugin(),
                                markdownShortcutPlugin(),

                              ]} className="text-muted-foreground text-xs md:text-sm line-clamp-2" />

                            </div>

                            {post.image_url && (
                              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={post.image_url}
                                  alt={post.heading}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                            {post.locations && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{post.locations.name}</span>
                              </div>
                            )}

                            {post.locations && <span>•</span>}
                            <span className="line-clamp-1">
                              {formatDistanceToNow(new Date(post?.created_at ?? ''), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <ArrowUp className="h-4 w-4" />
                              <span className="font-medium">{post.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-medium">{post.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="sticky top-4">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}