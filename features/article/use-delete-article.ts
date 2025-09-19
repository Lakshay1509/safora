import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.article.delete)[":id"]["$delete"]
>;



export const useDeleteArticle = (id:string) => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.article.delete[":id"]["$delete"]({
                param:{id:id}
            });

            if (!response.ok) {
                throw new Error("Failed to delete article");
            }

            return response.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["recent-article"] });
            queryClient.invalidateQueries({ queryKey: ["post",id] });
            toast.success("Post deleted successfully");
        },
        onError: (error) => {
            console.log("Delete post article:", error);
            toast.error("Failed to delete article");
        }
    });
};
