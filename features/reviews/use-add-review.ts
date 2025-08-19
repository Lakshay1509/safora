import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"

type ResponseType = InferResponseType<(typeof client.api.review.add)[":location_id"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.review.add)[":location_id"]["$post"]>["json"]

export const addReview = (location_id:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.review.add[":location_id"]["$post"]({
                param:{location_id},
                json
            });

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["locationReview"]});
        },
        onError:(error)=>{
            console.log(error);
        }
    })
}