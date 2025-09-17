import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.post.update)[":id"]["$put"]>
type RequestType = InferRequestType<(typeof client.api.post.update)[":id"]["$put"]>["json"]

export const EditPost = (id:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.post.update[":id"]["$put"]({
                param:{id:id},
                json
            });

            if(!response.ok){
                throw new Error("Failed to update post");
            }

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["location-post"]});
            queryClient.invalidateQueries({queryKey:["post",id]});
            toast.success("Post edited successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to edit post");
        }
    })
}