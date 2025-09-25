"use client"

import { useParams, useRouter } from "next/navigation";
import { useGetPost } from "@/features/post/use-get-byId";
import { format } from "date-fns";
import { useGetPostComments } from "@/features/post/use-get-post-comments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash } from "lucide-react";
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
import Comment from "./Comment";
import RightSidebar from "./RightSidebar";
import PostStats from "@/components/PostStats";
import PostDetailSkeleton from "./PostsSkeleton";
import ExploreMore from "./ExploreMore";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import Image from "next/image";
import { useDominantColor } from "@/lib/useDominantColour";

const Post = () => {
    const { user, loading } = useAuth();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const { data: post, isLoading, error } = useGetPost(postId);

    const { dominantColor, isLoading: colour_loading } = useDominantColor(post?.post.image_url ?? '');


    const deletePostMutation = useDeletePost(postId);

    const isAuthor = user && post?.post.user_id === user.id;

    const handleEditClick = () => {
        router.push(`/create-post?edit=true&post-id=${postId}&post-slug=${post?.post.slug}&location-id=${post?.post.location_id}`);
    };

    const handleDeleteClick = async () => {
        await deletePostMutation.mutateAsync();
        router.push(`/community`)
    }

    if (isLoading) {
        return (
            <PostDetailSkeleton />
        );
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
            <div className="flex justify-center">

                <div className="w-full max-w-3xl mx-4 p-4 bg-white rounded-lg mt-6 lg:mx-10 lg:mr-[22rem]">
                    <div className="flex space-x-2 items-start mb-2">
                        <AvatarCircle url={post?.post.users?.profile_url} name={post?.post.users?.name} size="40" />
                        <h1 className="text-2xl font-bold">{post?.post.heading}</h1>
                        <div className="flex flex-col justify-center items-center space-x-2 lg:flex-row">
                            {isAuthor && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditClick}
                                    className="flex items-center gap-1"
                                >
                                    <PenIcon size={16} />
                                    Edit
                                </Button>
                            )}
                            {isAuthor && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setIsDeleteDialogOpen(true) }}
                                    className="flex items-center gap-1"
                                >
                                    <Trash size={16} />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 my-4 ">
                        <span className="mr-2">By {post?.post.users?.name || "Anonymous"}</span>
                        <span className="mx-2">•</span>
                        <span>
                            {post?.post.created_at
                                ? format(new Date(post.post.created_at), 'MMM d, yyyy')
                                : "Unknown date"}
                        </span>


                    </div>

                    <div className="prose prose-lg max-w-none mb-8 text-base">
                        {post?.post.body}
                    </div>

                    {post?.post.image_url && (
                        <div className="my-4 -mx-4 sm:mx-0 rounded-lg overflow-hidden relative">
                            {/* Blurred background layer */}
                            <div
                                className="absolute inset-0 scale-110 blur-lg opacity-60"
                                style={{
                                    backgroundImage: `url(${post?.post.image_url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />

                            {/* Dynamic colored overlay */}
                            <div
                                className="absolute inset-0 transition-colors duration-300"
                                style={{
                                    backgroundColor: dominantColor || 'rgba(251, 191, 36, 0.2)'
                                }}
                            />

                            {/* Main image container */}
                            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                                <Image
                                    src={post?.post.image_url}
                                    alt="post-image"
                                    layout="fill"
                                    objectFit="contain"
                                    className="rounded-lg relative z-10"
                                />
                            </div>
                        </div>
                    )}

                    <PostStats id={postId} upvotes_count={post?.post.upvotes} comments={post?.post._count.posts_comments} />



                    {/* Comments section */}
                    <Comment postId={postId} />
                    <ExploreMore id={post?.post.location_id ? post.post.location_id : ''} />
                </div>
                {post?.post.location_id && <RightSidebar id={post?.post.location_id} />}
            </div>
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

export default Post;