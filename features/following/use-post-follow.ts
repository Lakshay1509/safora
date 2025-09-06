import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.following)["$post"]>
type RequestType = InferRequestType<(typeof client.api.following)["$post"]>["json"]

// Define the type for the query cache
type FollowQueryData = { data: { id: string } | null };

export const addFollow = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType, { previousFollow?: FollowQueryData }>({

        mutationFn : async(json)=>{
            const response = await client.api.following["$post"]({
                json,
                
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add follow");
            }

            return response.json();
        },
        onMutate: async (newFollow) => {
            await queryClient.cancelQueries({ queryKey: ["follow", newFollow.location_id] });

            const previousFollow = queryClient.getQueryData<FollowQueryData>(["follow", newFollow.location_id]);

            // Optimistically update to the new value
            queryClient.setQueryData<FollowQueryData>(
                ["follow", newFollow.location_id],
                (old) => ({ data: { id: 'optimistic-follow' } }) // Assume followed
            );

            return { previousFollow };
        },
        onError:(err, newFollow, context)=>{
            if (context?.previousFollow) {
                queryClient.setQueryData(["follow", newFollow.location_id], context.previousFollow);
            }
            console.log(err);
            toast.error("Failed to add follow");
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({queryKey:["follow", variables.location_id]});
            queryClient.invalidateQueries({queryKey:["location-stats"]});
        }
    })
}