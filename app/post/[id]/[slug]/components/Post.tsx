"use client"

import { useParams, useRouter } from "next/navigation";
import { useGetPost } from "@/features/post/use-get-byId";
import { format } from "date-fns";
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
import Image from "next/image";
import { useDominantColor } from "@/lib/useDominantColour";
import { headingsPlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";
import { extractUrls } from "@/lib/url-utils";
import { LinkPreview } from "@/components/LinkPreview";
import ProfileLogo from "@/components/ProfileLogo";
import PostStatsFeed from "@/components/PostsStatsFeed";


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
    const urls = extractUrls(post?.post.body ?? '');

    return (
        <>
            <main className="flex justify-center">

                <article className="w-full max-w-3xl mx-4 p-4 bg-white rounded-lg lg:mx-10 lg:mr-[22rem] pb-22">
                    <header className="flex space-x-3 items-start mb-2">
                        <div className="mt-1 flex-shrink-0">
                            <ProfileLogo
                                url={post?.post.users?.profile_url ?? ''}
                                name={post?.post.users?.name ?? ''}
                                color={post?.post.users?.profile_color ?? ''}
                                size="50"

                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div>
                                <h1 className="text-2xl font-bold">{post?.post.heading}</h1>
                                <div className="flex items-center text-sm text-gray-600 my-1 space-x-2">
                                    <div
                                        className="font-medium text-[14px]"
                                        style={{
                                            color: post?.post?.users?.profile_color || '#000000',
                                        }}
                                    >
                                        {post?.post?.users?.name}
                                    </div>

                                    {post?.post?.users?.verified && (
                                        <div>
                                            <Image src="/badge.svg" alt="badge" height={13} width={13} />
                                        </div>
                                    )}

                                    <div className="text-gray-400">•</div>

                                    <div>
                                        {post?.post?.created_at
                                            ? format(new Date(post.post.created_at), 'MMM d, yyyy')
                                            : 'Unknown date'}
                                    </div>
                                </div>

                            </div>
                        </div>


                    </header>



                    <div className="prose prose-lg max-w-none text-base">
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

                            ]}
                        />



                    </div>
                    {post?.post.image_url === null && urls.length > 0 && (
                        <div className="mt-3">
                            {urls.slice(0, 1).map((url, index) => (
                                <LinkPreview key={index} url={url} />
                            ))}
                        </div>
                    )}


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
                      {isAuthor && (<div className="flex flex-row justify-start items-center space-x-2 my-6">
                      
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
                                className="flex items-center gap-1 "
                            >
                                <Trash size={16} />
                                Delete
                            </Button>
                        
                    </div> )}

                    <PostStatsFeed id={postId} upvotes_count={post?.post.upvotes} comments={post?.post._count.posts_comments} upvoted={post?.post.upvote===1 ? true :false} slug={post?.post.slug ?? ''} />

                    <ExploreMore id={post?.post.location_id ? post.post.location_id : ''} />

                    {/* Comments section */}
                    <section aria-labelledby="comments-heading">
                        <Comment postId={postId} />
                    </section>


                </article>
                <footer>
                    {post?.post.location_id && <RightSidebar id={post?.post.location_id} />}
                </footer>
            </main>
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