import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetPostComments = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["post-comments",id],
        queryFn: async ()=>{
            const response = await client.api.post.comments[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get post comments");

            const data = await response.json();

            return data;
        }
    });

    return query;
}