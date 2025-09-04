import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationStats = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["location-stats",id],
        queryFn: async ()=>{
            const response = await client.api.location.location_stats[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}