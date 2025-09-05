import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetPostStats = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["post-stats",id],
        queryFn: async ()=>{
            const response = await client.api.post.stats[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}