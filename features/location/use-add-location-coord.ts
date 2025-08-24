import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"


type ResponseType = InferResponseType<(typeof client.api.location.createLocationByCoord)["$post"]>
type RequestType = InferRequestType<(typeof client.api.location.createLocationByCoord)["$post"]>["json"]

export const addLocationByCoord = ()=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.location.createLocationByCoord["$post"]({
                json
            });

            return response.json();
        },
        onSuccess:(data:any)=>{
            // Invalidate queries to ensure other parts of the app are up-to-date
            queryClient.invalidateQueries({queryKey:["location", {lon: data.location[0].lon, lat: data.location[0].lat}]});
            queryClient.invalidateQueries({queryKey:["locations"]}); // a general key if you have one
            
        },
        onError:(error)=>{
            console.log(error);
            
        }
    })
}