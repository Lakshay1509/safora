import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetPostCommunity = ()=>{
    const query = useQuery({
        queryKey: ["recent-post"],
        queryFn: async ()=>{
            const response = await client.api.community.recent.$get({
            
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}