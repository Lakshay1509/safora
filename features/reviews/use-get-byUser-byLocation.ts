import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"



export const useGetReviewByUser = (location_id:string,time_of_day:string)=>{
    const query = useQuery({
        enabled : !!location_id,
        queryKey: ["userReview", location_id, time_of_day], 
        queryFn: async ()=>{
            const response = await client.api.review.byUser[":location_id"][":time_of_day"].$get({
                param:{location_id,time_of_day},
            });

            if(!response.ok) throw new Error("failed to get review");

            const data = await response.json();

            return data;
        }
    });

    return query;
}