import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.following)[":id"]["$delete"]
>;

type RequestType = InferRequestType<
  (typeof client.api.following)[":id"]["$delete"]
>["param"];

export const useDeleteFollow = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (param) => {
            const response = await client.api.following[":id"]["$delete"]({
                param,
            });

            if (!response.ok) {
                throw new Error("Failed to delete follow");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            // Invalidate the specific query with the ID
            queryClient.invalidateQueries({ queryKey: ["follow", variables.id] });
            
            // Also invalidate any other related queries
            queryClient.invalidateQueries({ queryKey: ["follow"] });
            queryClient.invalidateQueries({queryKey:["location-stats"]});
           
            toast.success("Follow deleted successfully");
        },
        onError: (error) => {
            console.log("Delete follow error:", error);
            toast.error("Failed to delete follow");
        }
    });
};
