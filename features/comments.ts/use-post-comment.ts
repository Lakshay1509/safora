import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"

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
        },
        onError:(error)=>{
            console.log(error);
        }
    })
}