import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"

export const useGetleaderboard = ()=>{
   
    const query = useQuery({
        
        queryKey: ["code_leaderboard"],
        queryFn: async ()=>{
            const response = await client.api.referral.leaderboard.$get();

            if(!response.ok) {
                
                throw new Error("failed to get leaderboard ");

            }

            const data = await response.json();

            return data;
        },
    });

    return query;
}