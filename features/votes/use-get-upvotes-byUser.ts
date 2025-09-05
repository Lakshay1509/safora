import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetUpVotesByUser = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["upvotes-by-user",id],
        queryFn: async ()=>{
            const response = await client.api.upvotes[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get upvotes");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}