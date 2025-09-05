import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationPost = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["location-post",id],
        queryFn: async ()=>{
            const response = await client.api.post["by-locationId"][":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}