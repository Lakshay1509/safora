import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetTrending = ()=>{
    const query = useQuery({
        queryKey: ["trending"],
        queryFn: async ()=>{
            const response = await client.api.community.trending.$get({
            
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}