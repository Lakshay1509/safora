import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.post.delete)[":id"]["$delete"]
>;



export const useDeletePost = (id:string) => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.post.delete[":id"]["$delete"]({
                param:{id:id}
            });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["location-post"] });
            queryClient.invalidateQueries({ queryKey: ["post",id] });
            queryClient.invalidateQueries({queryKey:["location-stats"]});
            queryClient.invalidateQueries({queryKey:["recent-post"]});
            toast.success("Post deleted successfully");
        },
        onError: (error) => {
            console.log("Delete post error:", error);
            toast.error("Failed to delete post");
        }
    });
};
