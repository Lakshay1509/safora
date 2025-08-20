import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.review.delete)[":location_id"]["$delete"]
>;

export const useDeleteReview = (location_id:string) => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.review.delete[":location_id"]["$delete"]({
                param:{location_id:location_id}
            });

            if (!response.ok) {
                throw new Error("Failed to delete review");
            }

            return response.json();
        },
        onSuccess: async() => {
            await queryClient.invalidateQueries({ queryKey: ["locationReview"] }); 
            await queryClient.invalidateQueries({ queryKey: ["userReview"] }); 
        },
        onError: (error) => {
            console.log("Delete comment review:", error);
        }
    });
};
