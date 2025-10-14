import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetAchievment = ()=>{
    const query = useQuery({
    
        queryKey: ["userAchievment"],
        queryFn: async ()=>{
            const response = await client.api.achievment.default.$get();

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}