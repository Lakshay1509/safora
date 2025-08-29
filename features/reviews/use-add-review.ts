import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.review.add)[":location_id"][":time_of_day"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.review.add)[":location_id"][":time_of_day"]["$post"]>["json"]

export const addReview = (location_id:string,time_of_day:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.review.add[":location_id"][":time_of_day"]["$post"]({
                param:{location_id,time_of_day},
                json
            });

            if(!response.ok){

                throw new Error("Failed to create review");
            }

            return response.json();
        },
        onSuccess:async()=>{
            await queryClient.invalidateQueries({queryKey:["locationReview",location_id,time_of_day]});
            await queryClient.invalidateQueries({ queryKey: ["userReview",location_id,time_of_day] })
            await queryClient.invalidateQueries({ queryKey: ["userLocationCount"] }); 
            toast.success("Review created successfully ")
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to create review")
        }
    })
}