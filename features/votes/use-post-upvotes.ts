import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

// Define more specific types for cache manipulation
type PostStatsData = { upvotes: { upvotes: number }, comment_count: number };
type UpvotesByUserData = { upvotes: { vote_type: number } | null };

// Add types for Post and Feed updates
type PostData = {
    post: {
        id: string;
        upvotes: number;
        upvote: number;
        [key: string]: any;
    }
}

type InfinitePostData = {
    pages: Array<{
        data: Array<{
            id: string;
            upvotes: number;
            upvote: number;
            [key: string]: any;
        }>
    }>
    pageParams: any[];
}

type ResponseType = InferResponseType<(typeof client.api.upvotes)["$post"]>
type RequestType = InferRequestType<(typeof client.api.upvotes)["$post"]>["json"]

export const addUpvotetoPost = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType, { 
        previousStats?: PostStatsData, 
        previousUserVote?: UpvotesByUserData,
        previousPost?: PostData,
        previousFeed?: InfinitePostData
    }>({

        mutationFn : async(json)=>{
            const response = await client.api.upvotes["$post"]({
                json,
                
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add follow");
            }

            return response.json();
        },
        onMutate: async (newVote) => {
            // Cancel all related queries to prevent overwrites
            await queryClient.cancelQueries({ queryKey: ["upvotes-by-user", newVote.post_id] });
            await queryClient.cancelQueries({ queryKey: ["post", newVote.post_id] });
            await queryClient.cancelQueries({ queryKey: ["recent-post"] });

            const previousUserVote = queryClient.getQueryData<UpvotesByUserData>(["upvotes-by-user", newVote.post_id]);
            const previousPost = queryClient.getQueryData<PostData>(["post", newVote.post_id]);
            const previousFeed = queryClient.getQueryData<InfinitePostData>(["recent-post"]);

            // Optimistically update user's vote status
            queryClient.setQueryData<UpvotesByUserData>(["upvotes-by-user", newVote.post_id], (old) => {
                 if (!old) return undefined;
                 return {
                    ...old,
                    upvotes: {
                        ...old.upvotes,
                        vote_type: newVote.vote_type,
                    }
                 }
            });

            // Optimistically update single post cache (for Post.tsx)
            queryClient.setQueryData<PostData>(["post", newVote.post_id], (old) => {
                if (!old || !old.post) return old;
                
                const change = newVote.vote_type === 1 ? 1 : -1;
                
                return {
                    ...old,
                    post: {
                        ...old.post,
                        upvotes: old.post.upvotes + change,
                        upvote: newVote.vote_type === 1 ? 1 : 0
                    }
                };
            });

            // Optimistically update feed cache (for Posts.tsx)
            queryClient.setQueryData<InfinitePostData>(["recent-post"], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id === newVote.post_id) {
                                const change = newVote.vote_type === 1 ? 1 : -1;
                                return {
                                    ...post,
                                    upvotes: post.upvotes + change,
                                    upvote: newVote.vote_type === 1 ? 1 : 0
                                };
                            }
                            return post;
                        })
                    }))
                };
            });

            return { previousUserVote, previousPost, previousFeed };
        },
        onError:(err, newVote, context)=>{
            // Rollback on failure
            if (context?.previousUserVote) {
                queryClient.setQueryData(["upvotes-by-user", newVote.post_id], context.previousUserVote);
            }
            if (context?.previousPost) {
                queryClient.setQueryData(["post", newVote.post_id], context.previousPost);
            }
            if (context?.previousFeed) {
                queryClient.setQueryData(["recent-post"], context.previousFeed);
            }
            console.log(err);
            toast.error("Failed to add upvote");
        },
        onSettled: (data, error, variables) => {
            // Invalidate to refetch and sync with server state
            queryClient.invalidateQueries({queryKey:["upvotes-by-user", variables.post_id]})
            queryClient.invalidateQueries({queryKey:["post-stats",variables.post_id]})
            queryClient.invalidateQueries({queryKey:["post",variables.post_id]})
            queryClient.invalidateQueries({queryKey:["recent-post"]})
        }
    })
}
