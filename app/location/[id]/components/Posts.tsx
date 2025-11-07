"use client"

import { useGetLocationPost } from "@/features/post/use-get-by-locationId";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AvatarCircle from "@/app/profile/components/AvatarCircle";
import PostStatsFeed from "@/components/PostsStatsFeed";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProfileLogo from "@/components/ProfileLogo";
import { headingsPlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin } from "@mdxeditor/editor";

const Posts = () => {
    const params = useParams();
    const location_Id = params.id as string;
    const router = useRouter();

    const { data, isLoading, isError } = useGetLocationPost(location_Id);


    if (isLoading) {
        return <div className="p-4 text-center">Loading posts...</div>;
    }

    if (isError) {
        return <div className="p-4 flex justify-center items-center text-red-500">Error loading posts</div>;
    }

    if (!data || data.post.length === 0) {
        return (
            <div className="p-6 flex flex-col lg:flex-row items-center justify-center gap-6 text-center lg:text-left">
                <Image
                    src="/create-first.png"
                    alt="first-image"
                    height={150}
                    width={150}
                    className="flex-shrink-0"
                />
                <div className="flex-col space-y-2 ">
                    <p className="text-gray-700 text-base sm:text-lg font-medium max-w-md">
                        Start the conversation. <span className="text-blue-600 font-semibold">Be the first to contribute!</span>
                    </p>
                    <Button onClick={() => { router.push('/create-post') }} >Create Post</Button>
                </div>
            </div>
        );

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
                                    <ProfileLogo
                                        url={post?.users?.profile_url}
                                        name={post?.users?.name}
                                        color={post.users?.profile_color ?? ''}
                                        size="40"
                                    />
                                )}
                                <Link
                                    href={`/post/${post.id}/${post.slug}`}
                                    className="block text-black hover:text-gray-500 w-full"
                                >

                                    <h2 className="font-semibold text-lg line-clamp-1">{post.heading}</h2>
                                    <MDXEditor className="text-gray-700 mt-2 line-clamp-2" markdown={post.body} readOnly={true} plugins={[
                                        headingsPlugin(),
                                        listsPlugin(),
                                        quotePlugin(),
                                        thematicBreakPlugin(),
                                        markdownShortcutPlugin(),
                                        linkPlugin(),
                                        linkDialogPlugin(),
                                    ]} />

                                </Link>
                            </div>

                            {/* Social interaction bar */}
                            <PostStatsFeed
                                id={post.id}
                                upvotes_count={post.upvotes}
                                comments={post._count.posts_comments}
                                upvoted={post.upvote === 1}
                                slug={post.slug ?? ''}
                            />

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