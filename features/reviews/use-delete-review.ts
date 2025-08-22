import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.review.delete)[":location_id"][":time_of_day"]["$delete"]
>;

export const useDeleteReview = (location_id:string,time_of_day:string) => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.review.delete[":location_id"][":time_of_day"]["$delete"]({
                param:{location_id:location_id,time_of_day:time_of_day}
            });

            if (!response.ok) {
                throw new Error("Failed to delete review");
            }

            return response.json();
        },
        onSuccess: async() => {
            await queryClient.invalidateQueries({ queryKey: ["locationReview"] }); 
            await queryClient.invalidateQueries({ queryKey: ["userReview",location_id,time_of_day] }); 
            toast.success("Review deleted successfully")
        },
        onError: (error) => {
            console.log("Delete comment review:", error);
            toast.error("Failed to delete review");
        }
    });
};
