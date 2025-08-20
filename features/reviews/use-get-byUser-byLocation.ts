import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetReviewByUser = (location_id:string)=>{
    const query = useQuery({
        enabled : !!location_id,
        queryKey: ["userReview", location_id], // Include location_id in query key
        queryFn: async ()=>{
            const response = await client.api.review.byUser[":location_id"].$get({
                param:{location_id},
            });

            if(!response.ok) throw new Error("failed to get review");

            const data = await response.json();

            return data;
        }
    });

    return query;
}