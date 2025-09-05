import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetFollowingPost = ()=>{
    const query = useQuery({
        queryKey: ["following-post"],
        queryFn: async ()=>{
            const response = await client.api.community.following.$get({
            
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}