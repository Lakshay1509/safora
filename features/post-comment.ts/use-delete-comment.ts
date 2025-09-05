import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.post_comments.delete)[":commentId"]["$delete"]
>;

type RequestType = InferRequestType<
  (typeof client.api.post_comments.delete)[":commentId"]["$delete"]
>["param"];

export const useDeleteCommentPost = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (param) => {
            const response = await client.api.post_comments.delete[":commentId"]["$delete"]({
                param,
            });

            if (!response.ok) {
                throw new Error("Failed to delete comment");
            }

            return response.json();
        },
        onSuccess: (data, variables) => {
            // Invalidate queries related to post comments to refetch the list
            queryClient.invalidateQueries({ queryKey: ["post-comments"] });
            queryClient.invalidateQueries({ queryKey: ["post-stats"] });
            queryClient.invalidateQueries({queryKey:["post-sub-comments"]})
           
            toast.success("Comment deleted successfully");
        },
        onError: (error) => {
            console.log("Delete comment error:", error);
            toast.error("Failed to delete comment");
        }
    });
};
