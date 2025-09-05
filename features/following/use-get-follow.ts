import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetFollow = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["follow",id],
        queryFn: async ()=>{
            const response = await client.api.following[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get follow");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}