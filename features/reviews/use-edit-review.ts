import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.review.edit)[":location_id"][":time_of_day"]["$put"]>
type RequestType = InferRequestType<(typeof client.api.review.edit)[":location_id"][":time_of_day"]["$put"]>["json"]

export const EditReview = (location_id:string,time_of_day:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.review.edit[":location_id"][":time_of_day"]["$put"]({
                json,
                param:{location_id,time_of_day}
            });

            if(!response.ok){

                throw new Error("Failed to edit review");
            }

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["locationReview",location_id,time_of_day]});
            queryClient.invalidateQueries({queryKey:["userReview",location_id,time_of_day]})
            toast.success("Review edited successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to edit review");
        }
    })
}