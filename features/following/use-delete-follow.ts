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

// Define the type for the query cache
type FollowQueryData = { data: { id: string } | null };

export const useDeleteFollow = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType, { previousFollow?: FollowQueryData }>({
        mutationFn: async (param) => {
            const response = await client.api.following[":id"]["$delete"]({
                param,
            });

            if (!response.ok) {
                throw new Error("Failed to delete follow");
            }

            return response.json();
        },
        onMutate: async (deletedFollow) => {
            await queryClient.cancelQueries({ queryKey: ["follow", deletedFollow.id] });

            const previousFollow = queryClient.getQueryData<FollowQueryData>(["follow", deletedFollow.id]);

            // Optimistically update to unfollowed state
            queryClient.setQueryData<FollowQueryData>(
                ["follow", deletedFollow.id],
                { data: null }
            );

            return { previousFollow };
        },
        onError: (err, deletedFollow, context) => {
            if (context?.previousFollow) {
                queryClient.setQueryData(["follow", deletedFollow.id], context.previousFollow);
            }
            console.log("Delete follow error:", err);
            toast.error("Failed to delete follow");
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["follow", variables.id] });
            queryClient.invalidateQueries({queryKey:["location-stats"]});
        }
    });
};
