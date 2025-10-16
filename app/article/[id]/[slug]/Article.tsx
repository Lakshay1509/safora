"use client"

import { useParams, useRouter } from "next/navigation";
import { useGetPost } from "@/features/post/use-get-byId";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash, Share2, Settings, Link2, Heart, MessageCircle } from "lucide-react";
import { useDeletePost } from "@/features/post/use-delete-post";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import Comment from "@/app/post/[id]/[slug]/components/Comment"
import PostStats from "@/components/PostStats";
import PostDetailSkeleton from "@/app/post/[id]/[slug]/components/PostsSkeleton";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import Image from "next/image";
import { useDominantColor } from "@/lib/useDominantColour";
import ReactMarkdown from 'react-markdown'
import { estimateReadingTime } from "@/utils/timetoread";
import { headingsPlugin, imagePlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import { useDeleteArticle } from "@/features/article/use-delete-article";

const Article = () => {
    const { user, loading } = useAuth();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const { data: post, isLoading, error } = useGetPost(postId);


    const deletePostMutation = useDeleteArticle(postId);

    const isAuthor = user && post?.post.user_id === user.id;

    const handleEditClick = () => {
        router.push(`/create-article?edit=true&post-id=${postId}&post-slug=${post?.post.slug}`);
    };

    const handleDeleteClick = async () => {
        await deletePostMutation.mutateAsync();
        router.push(`/community`)
    }

    if (isLoading) {
        return <PostDetailSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-4 bg-red-50 rounded-lg mt-6">
                <p className="text-red-600">Failed to load post: {(error as Error).message}</p>
            </div>
        );
    }

    return (
        <>
            <main className="flex justify-center max-w-4xl mx-auto relative">
                {/* Floating action buttons on the right */}


                <article className="w-full max-w-4xl mx-auto py-8 px-4 pb-24">
                    {/* Author section */}
                    <header className="flex items-center justify-center mb-4">
                        <div className="flex flex-col items-center">
                            <AvatarCircle
                                url={post?.post.users?.profile_url}
                                name={post?.post.users?.name}
                                size="48"
                            />
                            <h3 className="mt-2 font-medium">{post?.post.users?.name || "Anonymous"}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span>
                                    {post?.post.created_at
                                        ? format(new Date(post.post.created_at), 'MMM d, yyyy')
                                        : "Unknown date"}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{estimateReadingTime(post?.post.body)} min read</span>
                            </div>
                        </div>
                    </header>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center mt-6 mb-8">
                        {post?.post.heading}
                    </h1>

                    {/* Featured Image */}
                    {post?.post.image_url && (
                       
                            <Image
                                src={post?.post.image_url}
                                alt={post?.post.heading || "Featured image"}
                                width={500}
                                height={500}
                                
                                className="mb-10 rounded-lg overflow-hidden mx-auto"
                            />
                        
                    )}

                    {/* Article content */}
                    <div className="prose prose-lg max-w-none">
                        <MDXEditor
                            markdown={post?.post.body ?? ''}
                            readOnly={true}
                            plugins={[

                                headingsPlugin(),
                                listsPlugin(),
                                quotePlugin(),
                                thematicBreakPlugin(),
                                markdownShortcutPlugin(),
                                linkPlugin(),
                                linkDialogPlugin(),
                                imagePlugin()


                            ]}
                        />
                    </div>

                    {/* Author controls */}
                    {isAuthor && (
                        <div className="flex gap-2 mt-8 justify-start">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditClick}
                                className="flex items-center gap-1"
                            >
                                <PenIcon size={16} />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setIsDeleteDialogOpen(true) }}
                                className="flex items-center gap-1"
                            >
                                <Trash size={16} />
                                Delete
                            </Button>
                        </div>
                    )}

                    <PostStats id={postId} upvotes_count={post?.post.upvotes} comments={post?.post._count.posts_comments} />


                    {/* Comments section */}
                    
                         <section aria-labelledby="comments-heading" className="mt-12">
                          <Comment postId={postId} />
                        </section>
                        
                    
                </article>
            </main>

            {/* Delete dialog remains unchanged */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-white border border-gray-200 text-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 font-semibold">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            This will permanently delete your post. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteClick}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default Article;