import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.comment.add)["$post"]>
type RequestType = InferRequestType<(typeof client.api.comment.add)["$post"]>["json"]

export const addComment = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.comment.add["$post"]({
                json
            });

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["locationComments"]});
            queryClient.invalidateQueries({queryKey:["userComments"]});
            queryClient.invalidateQueries({queryKey:["userLocationCount"]});
            toast.success("Comment added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to add comment");
        }
    })
}