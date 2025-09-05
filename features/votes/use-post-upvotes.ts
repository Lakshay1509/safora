import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.upvotes)["$post"]>
type RequestType = InferRequestType<(typeof client.api.upvotes)["$post"]>["json"]

export const addUpvotetoPost = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

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
        onSuccess:(data, variables)=>{
            // Invalidate the specific query with the location_id
            queryClient.invalidateQueries({queryKey:["upvotes-by-user", variables.post_id]})
            queryClient.invalidateQueries({queryKey:["post-stats",variables.post_id]})
        
            
            // toast.success("Upvote added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to add upvote");
        }
    })
}