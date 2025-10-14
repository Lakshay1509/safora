'use client'

import { useGetArticleCommunity } from "@/features/community/use-get-post-article"
import PostSkeleton from "./PostsSkeleton";
import Image from "next/image";
import { MessageCircle, ThumbsUp, Bookmark, PenIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RightSidebar from "./RightSidebar";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import { useAuth } from "@/contexts/AuthContext";
import ProfileLogo from "@/components/ProfileLogo";


const Articles = () => {
    const router = useRouter();
    const {user} = useAuth()
    const {data, isLoading, isError} = useGetArticleCommunity();

    if (isLoading) {
        return (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <PostSkeleton key={item} />
            ))}
          </div>)
      }

    if(isError || !data){
        return (
            <div className="text-center text-muted-foreground">
                Could not load articles.
            </div>
        )
    }

    const handleCreatePost = () => {
    if (user === null) {
      router.push('/login')
    }
    else {
      router.push("/create-article");
    }

  };

  return (
    <div className="flex flex-row justify-start w-full">
      {/* Main content area */}
      <section className="flex-1 max-w-4xl py-4 px-4 sm:px-6 min-w-0">
        <div className="w-full flex justify-end mb-6 pr-2">
            <Button onClick={handleCreatePost}>
                <PenIcon className="mr-1"/>Write 
            </Button>
        </div>
        
        <div className="space-y-10">
            {data.posts.map((post) => (
                <Link href={`/article/${post.id}/${post.slug}`} key={post.id}>
                <article 
                    key={post.id} 
                    className="flex border-b border-gray-200 py-6 
                              md:hover:bg-gray-50 md:px-3 md:rounded-lg
                              sm:flex-row flex-col"
                >
                    <div className="flex-1 pr-0 sm:pr-4 min-w-0">
                        <div className="flex items-center mb-2">
                            <div className="mr-2">
                            <ProfileLogo
                            url={post?.users?.profile_url}
                            name={post?.users?.name}
                            color={post.users?.profile_color ?? ''}
                            size="30"
                          />
                            </div>
                            <span 
  className="font-medium mx-2 text-[14px]"
  style={{
    color: post?.users?.profile_color || '#000000'
  }}
>
  {post?.users?.name}
</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">on</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                               {post.created_at ? format(new Date(post.created_at), "MMM dd, yyyy") : ""}
                            </span>
                        </div>
                        <h2 className="md:text-xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                            {post.heading}
                        </h2>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                            <div className="flex items-center mr-4">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                <span>{post._count.posts_comments}</span>
                            </div>
                            <div className="flex items-center mr-4">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                <span>{post.upvotes}</span>
                            </div>
                            
                        </div>
                    </div>
                    
                    {post.image_url && (
                        <div className="w-full h-32 sm:w-36 sm:h-24 relative flex-shrink-0 mt-3 sm:mt-0">
                            <Image 
                                src={post.image_url}
                                alt={post.heading}
                                fill
                                sizes="(max-width: 640px) 100vw, 150px"
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}
                </article>
                </Link>
            ))}
        </div>
      </section>

      {/* Sidebar - fixed width */}
      <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="sticky top-4">
          <RightSidebar/>
        </div>
      </aside>
    </div>
  )
}

export default Articles