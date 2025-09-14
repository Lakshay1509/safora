"use client"

import { useGetLocationPost } from "@/features/post/use-get-by-locationId";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowUp, ArrowDown, MessageCircle, Bookmark, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/PostStats";
import AvatarCircle from "@/app/profile/components/AvatarCircle";

const Posts = () => {
    const params = useParams();
    const location_Id = params.id as string;

    const { data, isLoading, isError } = useGetLocationPost(location_Id);

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
        return <div className="p-4 text-center">Loading posts...</div>;
    }

    if (isError) {
        return <div className="p-4 text-center text-red-500">Error loading posts</div>;
    }

    if (!data || data.post.length === 0) {
        return <div className="p-4 text-center">No posts found for this location</div>;
    }

    return (
        <section className="flex flex-col justify-start items-start">
            <div className="p-4 rounded-lg max-w-full">
                {/* <h1 className="text-xl font-bold mb-4">All Posts ({data.post.length})</h1> */}
                <div className="flex flex-col gap-4">


                    {data.post.map((post) => (
                        
                            <div key={post.id} className="p-2 py-3 lg:p-4 border-b border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50 text-sm">
                                <div className="flex items-start gap-3">
                                    {post.users && (
                                    <AvatarCircle url={post?.users?.profile_url} name={post?.users?.name} size="40"/>
                                                      )}
                                <Link
                                    href={`/post/${post.id}/${post.slug}`}
                                    className="block text-black hover:text-gray-500 w-full"
                                >   
                                    
                                    <h2 className="font-semibold text-lg">{truncateText(post.heading)}</h2>
                                    <p className="text-gray-700 mt-2">{truncateText(post.body, true)}</p>
                                </Link>
                                </div>

                                {/* Social interaction bar */}
                                <PostStats id={post?.id} upvotes_count={post?.upvotes} comments={post?._count?.posts_comments}/>

                                <div className="text-xs text-gray-500 mt-2">
                                    {post.created_at && new Date(post.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        
                    ))}

                </div>
            </div>
        </section>
    );
};

export default Posts;