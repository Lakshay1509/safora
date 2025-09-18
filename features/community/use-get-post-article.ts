import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetArticleCommunity = ()=>{
    const query = useQuery({
        queryKey: ["recent-article"],
        queryFn: async ()=>{
            const response = await client.api.community.articles.$get({
            
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}