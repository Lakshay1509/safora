import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetReview1 = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["locationReview",id],
        queryFn: async ()=>{
            const response = await client.api.review1.reviews1[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        }
    });

    return query;
}