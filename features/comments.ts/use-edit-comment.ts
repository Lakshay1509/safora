import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.comment.edit)["$put"]>
type RequestType = InferRequestType<(typeof client.api.comment.edit)["$put"]>["json"]

export const EditComment = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.comment.edit["$put"]({
                json
            });

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["locationComments"]});
            toast.success("Comment edited successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to edit comment");
        }
    })
}