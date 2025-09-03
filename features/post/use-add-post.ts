import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.post.add)[":location_id"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.post.add)[":location_id"]["$post"]>["json"]

export const addPost = (location_id:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.post.add[":location_id"]["$post"]({
                param:{location_id:location_id},
                json,
            
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add post");
            }

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["location-post"]});
            queryClient.invalidateQueries({queryKey:["post"]});
            toast.success("Post added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to post");
        }
    })
}