import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetPost = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["post",id],
        queryFn: async ()=>{
            const response = await client.api.post["by-ID"][":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}