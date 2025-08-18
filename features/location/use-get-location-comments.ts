import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationComments = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["locationComments"],
        queryFn: async ()=>{
            const response = await client.api.location.comments[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        }
    });

    return query;
}