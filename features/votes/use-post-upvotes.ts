import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

// Define more specific types for cache manipulation
type PostStatsData = { upvotes: { upvotes: number }, comment_count: number };
type UpvotesByUserData = { upvotes: { vote_type: number } | null };


type ResponseType = InferResponseType<(typeof client.api.upvotes)["$post"]>
type RequestType = InferRequestType<(typeof client.api.upvotes)["$post"]>["json"]

export const addUpvotetoPost = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType, { previousStats?: PostStatsData, previousUserVote?: UpvotesByUserData }>({

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
            await queryClient.cancelQueries({ queryKey: ["post-stats", newVote.post_id] });
            await queryClient.cancelQueries({ queryKey: ["upvotes-by-user", newVote.post_id] });

            const previousStats = queryClient.getQueryData<PostStatsData>(["post-stats", newVote.post_id]);
            const previousUserVote = queryClient.getQueryData<UpvotesByUserData>(["upvotes-by-user", newVote.post_id]);

            // Optimistically update post stats (upvote count)
            queryClient.setQueryData<PostStatsData>(["post-stats", newVote.post_id], (old) => {
                if (!old) return undefined;
                const currentUpvotes = old.upvotes.upvotes || 0;
                const newUpvotes = currentUpvotes + (newVote.vote_type === 1 ? 1 : -1);
                return {
                    ...old,
                    upvotes: {
                        ...old.upvotes,
                        upvotes: newUpvotes,
                    },
                };
            });

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

            return { previousStats, previousUserVote };
        },
        onError:(err, newVote, context)=>{
            // Rollback on failure
            if (context?.previousStats) {
                queryClient.setQueryData(["post-stats", newVote.post_id], context.previousStats);
            }
            if (context?.previousUserVote) {
                queryClient.setQueryData(["upvotes-by-user", newVote.post_id], context.previousUserVote);
            }
            console.log(err);
            toast.error("Failed to add upvote");
        },
        onSettled: (data, error, variables) => {
            // Invalidate to refetch and sync with server state
            queryClient.invalidateQueries({queryKey:["upvotes-by-user", variables.post_id]})
            queryClient.invalidateQueries({queryKey:["post-stats",variables.post_id]})
        }
    })
}