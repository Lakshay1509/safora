import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationReview = (id:string,time_of_day:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["locationReview",id,time_of_day],
        queryFn: async ()=>{
            const response = await client.api.location.reviews[":id"][":time_of_day"].$get({
                param:{id,time_of_day},
            });

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        }
    });

    return query;
}