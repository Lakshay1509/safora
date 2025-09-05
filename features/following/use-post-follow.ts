import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.following)["$post"]>
type RequestType = InferRequestType<(typeof client.api.following)["$post"]>["json"]

export const addFollow = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

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
        onSuccess:(data, variables)=>{
            // Invalidate the specific query with the location_id
            queryClient.invalidateQueries({queryKey:["follow", variables.location_id]});
            
            // Also invalidate any other related queries
            queryClient.invalidateQueries({queryKey:["follow"]});
            queryClient.invalidateQueries({queryKey:["location-stats"]});
            
            toast.success("Follow added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to add follow");
        }
    })
}